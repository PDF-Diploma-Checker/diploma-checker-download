#!/usr/bin/env python3
"""Add the full archive to a release that holds only the changed files, so that the download page offers the real version.

The manifest of such a release lists every file of the app and where its bytes lie in the pack parts, also in the parts
of older releases. Those files are written into the same archive that tools/prepare_release_assets.py makes in the app.

Usage: complete_release.py <tag> <linux|windows> <base|cpu|gpu> [--no-upload] [--out DIR]
"""

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request
import zipfile
import zlib
from pathlib import Path

REPO = "PDF-Diploma-Checker/diploma-checker-download"
APP_DIR_NAME = "DiplomaChecker"
PART_SIZE = 1900 * 1024 * 1024          # a little under GitHub's 2 GiB limit per file
CHUNK = 8 * 1024 * 1024
RETRIES = 5


def asset_url(tag, name):
    return f"https://github.com/{REPO}/releases/download/{tag}/{name}"


def release_assets(tag):
    answer = subprocess.run(["gh", "release", "view", tag, "-R", REPO, "--json", "assets"],
                            check=True, capture_output=True, text=True)
    return {asset["name"] for asset in json.loads(answer.stdout)["assets"]}


def fetch(url, target):
    for attempt in range(1, RETRIES + 1):
        try:
            with urllib.request.urlopen(url, timeout=60) as response, open(target, "wb") as out:
                shutil.copyfileobj(response, out, CHUNK)
            return
        except OSError as e:
            if attempt == RETRIES:
                raise
            print(f"Download of {url} failed ({e}), trying again")
            time.sleep(5 * attempt)


class Pack:
    """The parts of a pack read as one stream of bytes."""

    def __init__(self, paths):
        self.parts, start = [], 0
        for path in paths:
            size = path.stat().st_size
            self.parts.append((path, start, size))
            start += size

    def read(self, offset, length):
        for path, start, size in self.parts:
            first, stop = max(offset, start), min(offset + length, start + size)
            if first < stop:
                with open(path, "rb") as f:
                    f.seek(first - start)
                    left = stop - first
                    while left:
                        chunk = f.read(min(CHUNK, left))
                        if not chunk:
                            sys.exit(f"{path} is shorter than the manifest says")
                        left -= len(chunk)
                        yield chunk

    def remove(self):
        for path, _, _ in self.parts:
            path.unlink()


def unpack(pack, entry, target):
    """Write one file of the pack to `target` and check it against the manifest."""
    digest, size = hashlib.sha256(), 0
    unpacker = zlib.decompressobj() if entry["z"] == "zlib" else None
    with open(target, "wb") as out:
        for chunk in pack.read(entry["o"], entry["c"]):
            data = unpacker.decompress(chunk) if unpacker else chunk
            digest.update(data)
            size += len(data)
            out.write(data)
        if unpacker:
            data = unpacker.flush()
            digest.update(data)
            size += len(data)
            out.write(data)
    if size != entry["s"] or digest.hexdigest() != entry["h"]:
        sys.exit(f"{entry['p']} differs from the manifest")


def write_tar(pack, manifest, target, work):
    with tarfile.open(target, "w:gz", compresslevel=6) as archive:
        for entry in manifest["files"]:
            unpack(pack, entry, work)
            info = tarfile.TarInfo(f"{APP_DIR_NAME}/{entry['p']}")
            info.size, info.mode, info.mtime = entry["s"], entry["m"], int(time.time())
            with open(work, "rb") as f:
                archive.addfile(info, f)
        for link in manifest["links"]:
            info = tarfile.TarInfo(f"{APP_DIR_NAME}/{link['p']}")
            info.type, info.linkname, info.mtime = tarfile.SYMTYPE, link["t"], int(time.time())
            archive.addfile(info)


def write_zip(pack, manifest, target, work):
    if manifest["links"]:
        sys.exit("A zip archive cannot hold the links of this manifest")
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
        for entry in manifest["files"]:
            unpack(pack, entry, work)
            archive.write(work, f"{APP_DIR_NAME}/{entry['p']}")


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(CHUNK):
            digest.update(chunk)
    return digest.hexdigest()


def split_file(path):
    """Cut `path` into path.001, path.002, ... and remove the original. Returns the parts."""
    parts = []
    with open(path, "rb") as source:
        while chunk := source.read(min(CHUNK, PART_SIZE)):
            part = path.with_name(f"{path.name}.{len(parts) + 1:03d}")
            with open(part, "wb") as out:
                written = 0
                while chunk:
                    out.write(chunk)
                    written += len(chunk)
                    chunk = source.read(min(CHUNK, PART_SIZE - written)) if written < PART_SIZE else b""
            parts.append(part)
    path.unlink()
    return parts


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("tag")
    parser.add_argument("platform", choices=["linux", "windows"])
    parser.add_argument("variant", choices=["base", "cpu", "gpu"])
    parser.add_argument("--no-upload", action="store_true", help="keep the archive and do not add it to the release")
    parser.add_argument("--out", type=Path, help="folder for the archive (default: a temporary one)")
    args = parser.parse_args()

    stem = f"{APP_DIR_NAME}-{args.platform}-{args.variant}"
    archive_name = stem + (".zip" if args.platform == "windows" else ".tar.gz")
    manifest_name = stem + ".manifest.json"
    assets = release_assets(args.tag)
    if manifest_name not in assets:
        print(f"{args.tag} has no {manifest_name}: nothing to do")
        return
    if any(name == archive_name or name.startswith(archive_name + ".") for name in assets):
        print(f"{args.tag} already has {archive_name}: nothing to do")
        return

    temporary = tempfile.TemporaryDirectory()
    folder = args.out or Path(temporary.name)
    folder.mkdir(parents=True, exist_ok=True)
    manifest_path = folder / manifest_name
    fetch(asset_url(args.tag, manifest_name), manifest_path)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    paths = []
    for part in manifest["parts"]:
        path = folder / part["name"]
        print(f"Downloading {part['name']} of {part.get('release') or args.tag}")
        fetch(asset_url(part.get("release") or args.tag, part["name"]), path)
        if path.stat().st_size != int(part["size"]):
            sys.exit(f"{part['name']} has a different size than in the manifest")
        paths.append(path)
    pack = Pack(paths)

    target = folder / archive_name
    work = folder / "file.tmp"
    print(f"Writing {archive_name} ({len(manifest['files'])} files, version {manifest['version']})")
    (write_zip if args.platform == "windows" else write_tar)(pack, manifest, target, work)
    work.unlink()
    pack.remove()                       # the room is needed for the split below

    digest = sha256_of(target)
    sidecar = folder / f"{archive_name}.sha256"
    sidecar.write_text(f"{digest}  {archive_name}\n", encoding="utf-8")
    uploads = split_file(target) if target.stat().st_size >= PART_SIZE else [target]
    uploads.append(sidecar)
    for path in uploads:
        print(f"  {path.name}: {path.stat().st_size / 1024 / 1024:.1f} MiB")

    if not args.no_upload:
        subprocess.run(["gh", "release", "upload", args.tag, "-R", REPO, *map(os.fspath, uploads)], check=True)
        print(f"Added to {args.tag}")


if __name__ == "__main__":
    main()
