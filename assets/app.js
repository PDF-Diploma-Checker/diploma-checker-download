"use strict";

/* ---------------------------------------------------------------- settings
   Releases are read from this repository (public GitHub API). Change the line if they live elsewhere. */
const REPO = "PDF-Diploma-Checker/diploma-checker-download";
/* Repository linked in the footer (source code, issues). Same as REPO unless releases live in a separate repo. */
const SOURCE_REPO = "PDF-Diploma-Checker/app";
const CACHE_MINUTES = 10;

/* Release assets must be named  DiplomaChecker-<windows|linux>-<base|cpu|gpu>.<zip|tar.gz>
   Builds that are too big for GitHub (Extended / GPU) are linked from extended.json. */
const VARIANTS = ["base", "cpu", "gpu"];

/* ------------------------------------------------------------------- texts */
const TEXT = {
  pl: {
    title: "Pobierz DiplomaChecker",
    description: "Pobierz DiplomaChecker, aplikację desktopową do sprawdzania prac dyplomowych w formacie PDF. Windows i Linux.",
    h1: "Pobierz DiplomaChecker",
    lead: "Aplikacja desktopowa do sprawdzania prac dyplomowych w formacie PDF. Wybierz system i wersję.",
    os_label: "System operacyjny",
    version: "Wersja",
    base_name: "Podstawowa",
    base_desc: "Tryb szybki: analiza formalna i językowa oparta na regułach, bez modeli AI.",
    base_spec: "<span><strong>Zawiera:</strong> spaCy (pl_core_news_lg, en_core_web_lg), Morfeusz 2, Lingua (wykrywanie języka), sprawdzanie pisowni i LanguageTool.</span><span><strong>Wymaga:</strong> środowiska Java (JRE) w systemie, potrzebnego dla LanguageTool. Karta graficzna nie jest używana.</span>",
    cpu_name: "CPU",
    cpu_desc: "Zawartość wersji podstawowej oraz tryb dokładny (modele AI) liczony na procesorze.",
    cpu_spec: "<span><strong>Dodaje:</strong> llama-cpp-python z modelami Gemma 3 12B i LLaVA 1.6 Mistral 7B (kwantyzacja Q4_K_M) oraz sentence-transformers z PyTorch w wersji CPU.</span><span><strong>Wymaga:</strong> tego samego co wersja podstawowa oraz ok. 9 GB wolnego miejsca na modele, pobierane przy pierwszym użyciu trybu dokładnego. Analiza na procesorze trwa bardzo długo.</span>",
    gpu_name: "Rozszerzona (GPU, CUDA)",
    gpu_desc: "Zawartość wersji CPU, a tryb dokładny jest przyspieszany na karcie graficznej przez CUDA.",
    gpu_spec: "<span><strong>Zmienia:</strong> PyTorch z CUDA 12.8 oraz llama-cpp-python skompilowany z obsługą CUDA (warstwy modelu są przenoszone na GPU).</span><span><strong>Wymaga:</strong> karty graficznej NVIDIA z obsługą CUDA, sterownika zgodnego z CUDA 12.8 (od wersji 570) oraz zalecanych min. 8 GB VRAM. Pozostałe wymagania jak w wersji CPU. Karty AMD i Intel nie są obsługiwane.</span>",
    install_title: "Instalacja",
    win_1: "Rozpakuj pobrane archiwum <strong>.zip</strong> do dowolnego folderu.",
    win_2: "Uruchom <strong>DiplomaChecker.exe</strong> z rozpakowanego folderu.",
    win_3: "Jeśli Windows pokaże ekran „Windows ochronił Twój komputer”, wybierz <strong>Więcej informacji</strong>, a potem <strong>Uruchom mimo to</strong>. Aplikacja nie jest jeszcze podpisana certyfikatem wydawcy.",
    lin_1: "Otwórz terminal w folderze z pobranym archiwum i rozpakuj je: <code>tar -xzf DiplomaChecker-linux-*.tar.gz</code>",
    lin_2: "Wejdź do rozpakowanego folderu: <code>cd DiplomaChecker</code>",
    lin_3: "Uruchom aplikację: <code>./DiplomaChecker</code>",
    models_note: "W trybie dokładnym aplikacja zapyta o zgodę na pobranie modeli AI (Gemma i LLaVA). Potrzebne jest wtedy połączenie z internetem.",
    req_hint: "Do dokumentu możesz dołączyć plik wymagań formalnych (JSON). Przykładowe pliki i opis pól: <a href=\"wymagania.html\">wymagania formalne</a>.",
    req_footer: "Wymagania formalne",
    shot_alt: "Okno startowe DiplomaChecker z listą dokumentów",
    all_title: "Wszystkie wersje",
    repo: "Kod źródłowy",
    issues: "Zgłoś problem",
    download: "Pobierz",
    soon: "Wkrótce",
    unavailable: "Niedostępna",
    open_releases: "Otwórz wydania",
    release_meta: (tag, date) => `Wersja ${tag}, wydana ${date}.`,
    notes: "Notatki wydania",
    pick: "Wybierz",
    flag_pre: "wersja testowa",
    flag_latest: "najnowsza",
    latest_suffix: " (najnowsza)",
    pre_suffix: " (testowa)",
    sha: "Kopiuj sumę SHA-256",
    sha_done: "Skopiowano",
    err_load: "Nie udało się pobrać listy wersji. Wszystkie wydania znajdziesz na stronie GitHub.",
    err_empty: "Nie opublikowano jeszcze żadnej wersji.",
    mac_note: "Wersje dla macOS nie są jeszcze dostępne.",
    loading: "Wczytywanie…",
    no_versions: "Brak opublikowanych wersji.",
    action_label: (action, name, os) => `${action}: ${name}, ${os}`,
  },
  en: {
    title: "Download DiplomaChecker",
    description: "Download DiplomaChecker, a desktop app for checking diploma theses in PDF format. Windows and Linux.",
    h1: "Download DiplomaChecker",
    lead: "A desktop app for checking diploma theses in PDF format. Choose your system and version.",
    os_label: "Operating system",
    version: "Version",
    base_name: "Basic",
    base_desc: "Fast mode: rule-based formatting and language analysis, no AI models.",
    base_spec: "<span><strong>Includes:</strong> spaCy (pl_core_news_lg, en_core_web_lg), Morfeusz 2, Lingua (language detection), spell checking and LanguageTool.</span><span><strong>Requires:</strong> Java runtime (JRE) installed on the system, which LanguageTool needs. The graphics card is not used.</span>",
    cpu_name: "CPU",
    cpu_desc: "Everything in the basic build, plus detailed mode (AI models) running on the processor.",
    cpu_spec: "<span><strong>Adds:</strong> llama-cpp-python with the Gemma 3 12B and LLaVA 1.6 Mistral 7B models (Q4_K_M quantization) and sentence-transformers with the CPU build of PyTorch.</span><span><strong>Requires:</strong> the same as the basic build, plus about 9 GB of free disk space for the models, downloaded the first time detailed mode is used. Analysis on the processor takes a very long time.</span>",
    gpu_name: "Extended (GPU, CUDA)",
    gpu_desc: "Everything in the CPU build, with detailed mode accelerated on the graphics card through CUDA.",
    gpu_spec: "<span><strong>Changes:</strong> PyTorch with CUDA 12.8 and llama-cpp-python compiled with CUDA support (model layers are offloaded to the GPU).</span><span><strong>Requires:</strong> an NVIDIA graphics card with CUDA support, a driver compatible with CUDA 12.8 (version 570 or newer) and, as recommended, at least 8 GB of VRAM. Other requirements as in the CPU build. AMD and Intel graphics cards are not supported.</span>",
    install_title: "Installation",
    win_1: "Unpack the downloaded <strong>.zip</strong> archive to any folder.",
    win_2: "Run <strong>DiplomaChecker.exe</strong> from the unpacked folder.",
    win_3: "If Windows shows “Windows protected your PC”, choose <strong>More info</strong>, then <strong>Run anyway</strong>. The app is not signed with a publisher certificate yet.",
    lin_1: "Open a terminal in the folder with the downloaded archive and unpack it: <code>tar -xzf DiplomaChecker-linux-*.tar.gz</code>",
    lin_2: "Enter the unpacked folder: <code>cd DiplomaChecker</code>",
    lin_3: "Start the app: <code>./DiplomaChecker</code>",
    models_note: "In detailed mode the app asks for your permission to download the AI models (Gemma and LLaVA). An internet connection is needed for that.",
    req_hint: "You can attach a file with formatting requirements (JSON) to a document. Example files and a description of the fields: <a href=\"wymagania.html\">formatting requirements</a>.",
    req_footer: "Formatting requirements",
    shot_alt: "The DiplomaChecker start window with a list of documents",
    all_title: "All versions",
    repo: "Source code",
    issues: "Report a problem",
    download: "Download",
    soon: "Coming soon",
    unavailable: "Unavailable",
    open_releases: "Open releases",
    release_meta: (tag, date) => `Version ${tag}, released ${date}.`,
    notes: "Release notes",
    pick: "Select",
    flag_pre: "pre-release",
    flag_latest: "latest",
    latest_suffix: " (latest)",
    pre_suffix: " (pre-release)",
    sha: "Copy SHA-256 checksum",
    sha_done: "Copied",
    err_load: "Could not load the list of versions. You can find every release on GitHub.",
    err_empty: "No version has been published yet.",
    mac_note: "Versions for macOS are not available yet.",
    loading: "Loading…",
    no_versions: "No published versions.",
    action_label: (action, name, os) => `${action}: ${name}, ${os}`,
  },
};

/* ------------------------------------------------------------------- state */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const state = {
  lang: "pl",
  os: "windows",
  tag: null,          // selected release tag
  releases: [],       // newest first
  extended: { latest: {}, versions: {} },
  loaded: false,
  failed: false,
};

const OS_NAMES = { windows: "Windows", linux: "Linux" };
const tr = (key) => TEXT[state.lang][key];

function readPref(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
}

function detectLang() {
  const saved = readPref("dc-lang");
  if (saved === "pl" || saved === "en") return saved;
  return (navigator.language || "").toLowerCase().startsWith("pl") ? "pl" : "en";
}
function detectOS() {
  const saved = readPref("dc-os");
  if (saved === "windows" || saved === "linux") return saved;
  const ua = navigator.userAgent || "";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "windows";
}

const locale = () => (state.lang === "pl" ? "pl-PL" : "en-GB");
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
}
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes >= 1e9) return (bytes / 1e9).toLocaleString(locale(), { maximumFractionDigits: 1 }) + " GB";
  return Math.max(1, Math.round(bytes / 1e6)).toLocaleString(locale()) + " MB";
}

/* -------------------------------------------------------------------- data */
function slim(r) {
  return {
    tag: r.tag_name,
    date: r.published_at || r.created_at,
    url: r.html_url,
    prerelease: !!r.prerelease,
    assets: (r.assets || []).map((a) => ({
      name: a.name, size: a.size, url: a.browser_download_url, digest: a.digest || "",
    })),
  };
}

async function loadReleases() {
  const key = "dc-releases";
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (cached && Date.now() - cached.t < CACHE_MINUTES * 60000) return cached.data;
  } catch (e) { /* no cache */ }

  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("GitHub API " + res.status);
  const data = (await res.json()).filter((r) => !r.draft).map(slim);
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch (e) { /* ignore */ }
  return data;
}

async function loadExtended() {
  try {
    const res = await fetch("extended.json", { cache: "no-cache" });
    if (!res.ok) return;
    const data = await res.json();
    state.extended = { latest: data.latest || {}, versions: data.versions || {} };
  } catch (e) { /* optional file */ }
}

const latestTag = () => {
  const stable = state.releases.find((r) => !r.prerelease);
  return (stable || state.releases[0] || {}).tag || null;
};
const currentRelease = () => state.releases.find((r) => r.tag === state.tag) || null;

/* What can be downloaded for one variant of the selected release and system. */
function resolve(variant) {
  const release = currentRelease();
  if (!release) return { missing: true };
  const pattern = new RegExp(`^DiplomaChecker-${state.os}-${variant}\\.(zip|tar\\.gz)$`, "i");
  const asset = release.assets.find((a) => pattern.test(a.name));
  if (asset) return { url: asset.url, size: formatSize(asset.size), digest: asset.digest };

  if (variant === "gpu") {
    const known = state.extended.versions[release.tag] || (release.tag === latestTag() ? state.extended.latest : null);
    const entry = known && known[state.os];
    if (entry && entry.url) return { url: entry.url, size: entry.size || "", digest: "" };
    if (entry) return { soon: true };
  }
  return { missing: true };
}

/* --------------------------------------------------------------- rendering */
function setAction(link, { href, label, ariaLabel }) {
  link.textContent = label;
  link.setAttribute("aria-label", ariaLabel || label);
  if (href) {
    link.href = href;
    link.rel = "noopener";
    link.removeAttribute("aria-disabled");
  } else {
    link.removeAttribute("href");
    link.removeAttribute("rel");
    link.setAttribute("aria-disabled", "true");
  }
}

function renderRows() {
  const releasesPage = `https://github.com/${REPO}/releases`;
  for (const row of $$("#variants .row")) {
    const variant = row.dataset.variant;
    const link = $("[data-action]", row);
    const size = $("[data-size]", row);
    const name = tr(variant + "_name");
    const full = (action) => TEXT[state.lang].action_label(action, name, OS_NAMES[state.os]);
    let shaButton = $(".sha", row);
    if (shaButton) shaButton.remove();

    if (state.failed) {
      size.textContent = "";
      setAction(link, { href: releasesPage, label: tr("open_releases"), ariaLabel: full(tr("open_releases")) });
      continue;
    }
    if (!state.loaded) {
      size.textContent = "";
      setAction(link, { label: tr("download"), ariaLabel: tr("loading") });
      continue;
    }

    const found = resolve(variant);
    if (found.url) {
      size.textContent = found.size;
      setAction(link, { href: found.url, label: tr("download"), ariaLabel: full(tr("download")) });
      if (found.digest.startsWith("sha256:")) {
        shaButton = document.createElement("button");
        shaButton.type = "button";
        shaButton.className = "sha";
        shaButton.textContent = tr("sha");
        shaButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(found.digest.slice(7));
            shaButton.textContent = tr("sha_done");
            setTimeout(() => { shaButton.textContent = tr("sha"); }, 1800);
          } catch (e) { /* clipboard blocked: ignore */ }
        });
        $(".info", row).appendChild(shaButton);
      }
    } else {
      size.textContent = "";
      const label = found.soon || !state.releases.length ? tr("soon") : tr("unavailable");
      setAction(link, { label, ariaLabel: full(label) });
    }
  }
}

function renderNotice() {
  const notice = $("#notice");
  let message = "";
  if (state.failed) message = tr("err_load");
  else if (state.loaded && !state.releases.length) message = tr("err_empty");
  else if (/Macintosh/.test(navigator.userAgent || "")) message = tr("mac_note");
  notice.textContent = message;
  notice.hidden = !message;
}

function renderVersionSelect() {
  const select = $("#version");
  select.textContent = "";
  const newest = latestTag();
  for (const release of state.releases) {
    const option = document.createElement("option");
    option.value = release.tag;
    let label = release.tag;
    if (release.tag === newest) label += tr("latest_suffix");
    else if (release.prerelease) label += tr("pre_suffix");
    option.textContent = label;
    select.appendChild(option);
  }
  if (!state.releases.length) {
    const option = document.createElement("option");
    option.textContent = state.loaded ? "–" : tr("loading");
    select.appendChild(option);
  }
  select.disabled = !state.releases.length;
  if (state.tag) select.value = state.tag;
}

function renderMeta() {
  const meta = $("#release-meta");
  meta.textContent = "";
  const release = currentRelease();
  if (!release) return;
  meta.append(TEXT[state.lang].release_meta(release.tag, formatDate(release.date)) + " ");
  const notes = document.createElement("a");
  notes.href = release.url;
  notes.rel = "noopener";
  notes.textContent = tr("notes");
  meta.appendChild(notes);
}

function renderAllVersions() {
  const list = $("#all-versions");
  list.textContent = "";
  if (!state.releases.length) {
    const empty = document.createElement("li");
    empty.className = "v-empty";
    empty.textContent = state.failed ? tr("err_load") : (state.loaded ? tr("no_versions") : tr("loading"));
    list.appendChild(empty);
    return;
  }
  const newest = latestTag();
  for (const release of state.releases) {
    const row = document.createElement("li");
    row.className = "row";

    const title = document.createElement("div");
    title.className = "v-title";
    const tag = document.createElement("span");
    tag.className = "v-tag";
    tag.textContent = release.tag;
    const date = document.createElement("span");
    date.className = "v-date";
    date.textContent = formatDate(release.date);
    title.append(tag, date);
    const flag = release.prerelease ? tr("flag_pre") : (release.tag === newest ? tr("flag_latest") : "");
    if (flag) {
      const badge = document.createElement("span");
      badge.className = "v-flag";
      badge.textContent = flag;
      title.appendChild(badge);
    }

    const links = document.createElement("div");
    links.className = "v-links";
    const pick = document.createElement("button");
    pick.type = "button";
    pick.textContent = tr("pick");
    pick.setAttribute("aria-label", `${tr("pick")} ${release.tag}`);
    pick.addEventListener("click", () => {
      selectVersion(release.tag);
      const target = $(".chooser");
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    });
    const notes = document.createElement("a");
    notes.href = release.url;
    notes.rel = "noopener";
    notes.textContent = tr("notes");
    links.append(pick, notes);

    row.append(title, links);
    list.appendChild(row);
  }
}

function renderOs() {
  for (const input of $$('#os input')) input.checked = input.value === state.os;
  for (const steps of $$("[data-os-steps]")) steps.hidden = steps.dataset.osSteps !== state.os;
}

function render() {
  renderOs();
  renderVersionSelect();
  renderRows();
  renderNotice();
  renderMeta();
  renderAllVersions();
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.title = tr("title");
  const description = $('meta[name="description"]');
  if (description) description.setAttribute("content", tr("description"));
  for (const el of $$("[data-i18n]")) el.textContent = tr(el.dataset.i18n);
  for (const el of $$("[data-i18n-html]")) el.innerHTML = tr(el.dataset.i18nHtml);   // our own constant strings
  for (const el of $$("[data-i18n-aria]")) el.setAttribute("aria-label", tr(el.dataset.i18nAria));
  const shot = $("#shot");
  shot.src = `assets/img/app-${state.lang}.webp`;
  shot.alt = tr("shot_alt");
  for (const input of $$("#lang input")) input.checked = input.value === state.lang;
  render();
}

function selectVersion(tag) {
  state.tag = tag;
  try { history.replaceState(null, "", "#" + encodeURIComponent(tag)); } catch (e) { /* file:// */ }
  render();
}

/* -------------------------------------------------------------------- boot */
function init() {
  state.lang = detectLang();
  state.os = detectOS();

  $("#link-repo").href = `https://github.com/${SOURCE_REPO}`;
  $("#link-issues").href = `https://github.com/${SOURCE_REPO}/issues`;

  $("#lang").addEventListener("change", (event) => {
    state.lang = event.target.value;
    savePref("dc-lang", state.lang);
    applyLang();
  });
  $("#os").addEventListener("change", (event) => {
    state.os = event.target.value;
    savePref("dc-os", state.os);
    render();
  });
  $("#version").addEventListener("change", (event) => selectVersion(event.target.value));

  applyLang();

  Promise.all([
    loadReleases().catch(() => { state.failed = true; return []; }),
    loadExtended(),
  ]).then(([releases]) => {
    state.releases = releases;
    state.loaded = true;
    const wanted = decodeURIComponent((location.hash || "").slice(1));
    state.tag = releases.some((r) => r.tag === wanted) ? wanted : latestTag();
    render();
  });
}

init();
