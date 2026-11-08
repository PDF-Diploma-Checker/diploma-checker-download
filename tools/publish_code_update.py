#!/usr/bin/env python3
"""Publish a small update for every platform and variant when the app's main branch has a newer version.

No build is needed: such an update changes only our Python files, which the app keeps as plain files. The manifest of
the latest release describes all the rest, and its files stay in the pack parts of the older releases. Changes that
need a full build (libraries, data files, the launcher) stop the script and are left for a person to release.

Usage: publish_code_update.py --app <checkout of the app with its whole history> [--no-upload] [--out DIR]
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = "PDF-Diploma-Checker/diploma-checker-download"
PLATFORMS = ("linux", "windows")
VARIANTS = ("base", "cpu", "gpu")
VERSION_FILE = "src/common/version.py"


def gh(*args):
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def stop(message):
    """Nothing to publish now. Not an error: the workflow runs again and must not report a failure each time."""
    print(message)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as summary:
            summary.write(message + "\n")
    sys.exit(0)


def commit_of_version(patch_code, version):
    """The newest commit of the app that has this version: the code of a release with this number."""
    for sha in patch_code.git("log", "--format=%H", "--", VERSION_FILE).split():
        match = re.search(r'^APP_VERSION = "([^"]+)"', patch_code.git("show", f"{sha}:{VERSION_FILE}"), re.M)
        if match and match.group(1) == version:
            return sha
    return None


def build_update(delta, app, old, base_tag, changes, version, platform, variant, out, work):
    """Write the new pack part and the manifest of one variant. Returns the files to upload."""
    written = {"_internal/VERSION.txt": work}
    work.write_text(version + "\n", encoding="utf-8")
    removed = set()
    for status, path in changes:
        if path.startswith("src/"):
            name = "_internal/" + path[len("src/"):]
            if status == "D":
                removed.add(name)
            else:
                written[name] = app / path

    parts = [{**part, "release": part.get("release") or base_tag} for part in old["parts"]]
    writer = delta._PartWriter(out, delta.pack_name(platform, variant), delta.PART_SIZE, first_number=len(parts) + 1)
    base_total = int(old["total"])

    def entry(name, path, mode):
        start = writer.offset
        method, size, digest = delta._write_file(writer, path)
        return {"p": name, "s": size, "h": digest, "m": mode, "o": base_total + start,
                "c": writer.offset - start, "z": method}

    files = []
    for known in old["files"]:
        if known["p"] in written:
            files.append(entry(known["p"], written.pop(known["p"]), known["m"]))
        elif known["p"] not in removed:
            files.append(known)
    files += [entry(name, path, 0o644) for name, path in written.items()]
    new_parts = writer.close()
    manifest = delta._write_manifest(out, platform, variant, version, parts + new_parts, base_total + writer.offset,
                                     files, old["links"])
    delta.validate_manifest(manifest)
    return [out / part["name"] for part in new_parts] + [out / delta.manifest_name(platform, variant)]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--app", type=Path, required=True)
    parser.add_argument("--no-upload", action="store_true", help="only write the files, do not touch the releases")
    parser.add_argument("--out", type=Path, help="folder for the files (default: a temporary one)")
    args = parser.parse_args()
    app = args.app.resolve()
    sys.path[:0] = [str(app / "tools"), str(app / "src")]
    import patch_code
    from common import delta
    from common.update_check import is_newer

    base_tag = json.loads(gh("release", "view", "-R", REPO, "--json", "tagName"))["tagName"]
    version = patch_code.app_version()
    tag = f"v{version}"
    if not is_newer(version, base_tag):
        stop(f"The app has version {version} and the latest release is {base_tag}: nothing to publish")
    existing = subprocess.run(["gh", "release", "view", tag, "-R", REPO], capture_output=True, text=True)
    if existing.returncode == 0:
        stop(f"{tag} already exists, maybe as a draft: it is left alone")

    since = commit_of_version(patch_code, base_tag.lstrip("vV"))
    if since is None:
        stop(f"No commit of the app has the version of {base_tag}: it has to be released by hand")
    changes = patch_code.changed_files(since)
    blocked = patch_code.needs_full_build(since, changes)
    if blocked:
        stop(f"{tag} needs a full build:\n" + "\n".join(f"- {reason}" for reason in blocked))
    if not any(path.startswith("src/") and path != VERSION_FILE for _, path in changes):
        stop(f"{tag} does not change the app: nothing to publish")
    print(f"{tag} on top of {base_tag} ({since}):")
    for status, path in changes:
        print(f"  {status} {path}")

    temporary = tempfile.TemporaryDirectory()
    folder = args.out or Path(temporary.name)
    folder.mkdir(parents=True, exist_ok=True)
    uploads = []
    for platform in PLATFORMS:
        for variant in VARIANTS:
            name = delta.manifest_name(platform, variant)
            base = folder / "base" / name
            base.parent.mkdir(exist_ok=True)
            gh("release", "download", base_tag, "-R", REPO, "-p", name, "-O", str(base), "--clobber")
            old = delta.validate_manifest(json.loads(base.read_text(encoding="utf-8")))
            uploads += build_update(delta, app, old, base_tag, changes, version, platform, variant, folder,
                                    folder / "VERSION.txt")
    for path in uploads:
        print(f"  {path.name}: {path.stat().st_size / 1024:.1f} KiB")
    if args.no_upload:
        return

    subjects = patch_code.git("log", "--no-merges", "--format=%s", f"{since}..HEAD").splitlines()
    notes = "\n".join(f"- {subject}" for subject in subjects if not subject.startswith("Set the version to"))
    # a draft first: nobody may get a release whose files are not all there yet
    gh("release", "create", tag, "-R", REPO, "--draft", "--title", tag, "--notes", notes, *map(os.fspath, uploads))
    gh("release", "edit", tag, "-R", REPO, "--draft=false", "--latest")
    # a release published with the workflow's token starts no other workflow by itself
    gh("workflow", "run", "complete_release.yml", "-R", REPO, "-f", f"tag={tag}")
    print(f"Published {tag}")


if __name__ == "__main__":
    main()
