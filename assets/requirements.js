"use strict";

/* Page with the example formatting-requirement files (wymagania.html).
   Everything here is static text: the JSON files are only offered for download, they are never read by the page. */

const TEXT = {
  pl: {
    title: "Wymagania formalne | DiplomaChecker",
    description: "Przykładowe pliki JSON z wymaganiami formalnymi pracy dyplomowej dla DiplomaChecker, według wytycznych Politechniki Gdańskiej.",
    back: "← Pobierz DiplomaChecker",
    back_footer: "Pobierz aplikację",
    h1: "Wymagania formalne",
    lead: "Plik JSON opisuje, jak ma być sformatowana praca dyplomowa: liczbę stron, czcionkę, interlinię i marginesy. Dołączasz go do dokumentu w aplikacji, a DiplomaChecker sprawdza pracę według tych parametrów.",
    disclaimer: "To są przykładowe pliki, przygotowane według wytycznych Politechniki Gdańskiej. Wymagania różnią się między uczelniami, wydziałami i promotorami, więc sprawdź zasady, które dotyczą Twojej pracy, i w razie potrzeby zmień wartości w pliku.",
    files_title: "Pliki do pobrania",
    eng_name: "Praca inżynierska",
    eng_desc: "Plik wymagania_inz.json. Zakres 40–60 stron.",
    msc_name: "Praca magisterska",
    msc_desc: "Plik wymagania_mag.json. Zakres 60–80 stron.",
    download: "Pobierz",
    download_eng: "Pobierz: wymagania dla pracy inżynierskiej (JSON)",
    download_msc: "Pobierz: wymagania dla pracy magisterskiej (JSON)",
    use_title: "Jak użyć pliku",
    use_1: "Pobierz plik odpowiedni dla swojego typu pracy.",
    use_2: "Jeśli to potrzebne, otwórz go w dowolnym edytorze tekstu (np. w Notatniku) i dopasuj wartości do swoich wymagań. <strong>Nazw pól nie zmieniaj</strong>, a wartości zostaw w cudzysłowach.",
    use_3: "W DiplomaChecker dodaj dokument PDF, a potem dołącz plik przyciskiem <strong>Dodaj plik konfiguracyjny</strong> albo przeciągnij go na pole „Przeciągnij tu plik konfiguracyjny”.",
    fields_title: "Opis pól",
    fields_note: "Przykładowe wartości pochodzą z pobieranych plików. Zakres stron różni się między pracą inżynierską i magisterską, reszta jest taka sama.",
    fields: [
      ["interlinia", "Odstęp między wierszami tekstu.", "1.5"],
      ["minimalna_liczba_stron", "Najmniejsza dopuszczalna liczba stron pracy.", "40 (inż.), 60 (mgr)"],
      ["maksymalna_liczba_stron", "Największa dopuszczalna liczba stron pracy.", "60 (inż.), 80 (mgr)"],
      ["rozmiar_czcionki", "Rozmiar czcionki w punktach.", "10"],
      ["margines", "Rodzaj marginesów. Lustrzany oznacza margines wewnętrzny i zewnętrzny zamiast lewego i prawego.", "lustrzany"],
      ["format", "Format papieru.", "A4"],
      ["orientacja", "Orientacja strony.", "pionowa"],
      ["justowanie", "Czy tekst ma być wyjustowany, czyli wyrównany do obu marginesów.", "tak"],
      ["czcionka", "Lista dozwolonych czcionek, ponumerowana od 1.", "FF Sanuk Pro Light, FF Sanuk Pro Medium, Arial"],
      ["wymagany_rozdzial_SOTA", "Czy praca musi zawierać rozdział z przeglądem stanu wiedzy (State of the Art).", "tak"],
    ],
    example: "Przykład",
    repo: "Kod źródłowy",
    issues: "Zgłoś problem",
  },
  en: {
    title: "Formatting requirements | DiplomaChecker",
    description: "Example JSON files with thesis formatting requirements for DiplomaChecker, based on the Gdańsk University of Technology guidelines.",
    back: "← Download DiplomaChecker",
    back_footer: "Download the app",
    h1: "Formatting requirements",
    lead: "A JSON file describes how a thesis should be formatted: page count, font, line spacing and margins. You attach it to a document in the app, and DiplomaChecker checks the thesis against these parameters.",
    disclaimer: "These are example files, prepared according to the Gdańsk University of Technology guidelines. Requirements differ between universities, faculties and supervisors, so check the rules that apply to your thesis and change the values in the file if needed.",
    files_title: "Files to download",
    eng_name: "Engineer's thesis",
    eng_desc: "File wymagania_inz.json. Range of 40–60 pages.",
    msc_name: "Master's thesis",
    msc_desc: "File wymagania_mag.json. Range of 60–80 pages.",
    download: "Download",
    download_eng: "Download: requirements for an engineer's thesis (JSON)",
    download_msc: "Download: requirements for a master's thesis (JSON)",
    use_title: "How to use the file",
    use_1: "Download the file that matches your type of thesis.",
    use_2: "If needed, open it in any text editor (for example Notepad) and adjust the values to your requirements. <strong>Do not change the field names</strong>, and keep the values in quotation marks.",
    use_3: "In DiplomaChecker, add a PDF document, then attach the file with the <strong>Add configuration file</strong> button or drag it onto the “Drag the configuration file here” area.",
    fields_title: "Field descriptions",
    fields_note: "The example values come from the downloadable files. Only the page range differs between the engineer's and master's thesis.",
    fields: [
      ["interlinia", "Spacing between lines of text (line spacing).", "1.5"],
      ["minimalna_liczba_stron", "The smallest allowed number of pages.", "40 (engineer), 60 (master)"],
      ["maksymalna_liczba_stron", "The largest allowed number of pages.", "60 (engineer), 80 (master)"],
      ["rozmiar_czcionki", "Font size in points.", "10"],
      ["margines", "Type of margins. “Mirrored” (lustrzany) means inner and outer margins instead of left and right.", "lustrzany"],
      ["format", "Paper format.", "A4"],
      ["orientacja", "Page orientation (pionowa = portrait).", "pionowa"],
      ["justowanie", "Whether the text must be justified, that is aligned to both margins (tak = yes).", "tak"],
      ["czcionka", "List of allowed fonts, numbered from 1.", "FF Sanuk Pro Light, FF Sanuk Pro Medium, Arial"],
      ["wymagany_rozdzial_SOTA", "Whether the thesis must contain a State of the Art chapter (tak = yes).", "tak"],
    ],
    example: "Example",
    repo: "Source code",
    issues: "Report a problem",
  },
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
let lang = "pl";

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

function renderFields(text) {
  const list = $("#fields");
  list.textContent = "";
  for (const [key, meaning, example] of text.fields) {
    const row = document.createElement("div");
    row.className = "field";
    const term = document.createElement("dt");
    const code = document.createElement("code");
    code.textContent = key;
    term.appendChild(code);
    const detail = document.createElement("dd");
    detail.append(meaning + " ");
    const sample = document.createElement("span");
    sample.className = "sample";
    sample.textContent = `${text.example}: ${example}`;
    detail.appendChild(sample);
    row.append(term, detail);
    list.appendChild(row);
  }
}

function applyLang() {
  const text = TEXT[lang];
  document.documentElement.lang = lang;
  document.title = text.title;
  const description = $('meta[name="description"]');
  if (description) description.setAttribute("content", text.description);
  for (const el of $$("[data-i18n]")) el.textContent = text[el.dataset.i18n];
  for (const el of $$("[data-i18n-html]")) el.innerHTML = text[el.dataset.i18nHtml];   // our own constant strings
  for (const link of $$("[data-file]")) link.setAttribute("aria-label", text["download_" + link.dataset.file]);
  for (const input of $$("#lang input")) input.checked = input.value === lang;
  renderFields(text);
}

lang = detectLang();
$("#lang").addEventListener("change", (event) => {
  lang = event.target.value;
  savePref("dc-lang", lang);
  applyLang();
});
applyLang();
