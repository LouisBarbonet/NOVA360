import "./style.css";
import { memoryAt, versions } from "./data";
import { esc, linkifyCitations } from "./ui";
import { precomputedAnswer } from "./questions";

// Relais du chat : serveur de dev en local, Cloudflare Worker pour le site publié (VITE_CHAT_URL au build)
const CHAT_URL = import.meta.env.VITE_CHAT_URL || "api/chat";
import * as V from "./views";

const app = document.getElementById("app")!;
const versionSelect = document.getElementById("version") as HTMLSelectElement;

function storedVersion(): string {
  try {
    return localStorage.getItem("nova-version") ?? "";
  } catch {
    return "";
  }
}
const available = versions();
let version = available.some((v) => v.id === storedVersion()) ? storedVersion() : available[available.length - 1].id;

versionSelect.innerHTML = available.map((v) => `<option value="${esc(v.id)}">${esc(v.label)}</option>`).join("");
versionSelect.value = version;
versionSelect.addEventListener("change", () => setVersion(versionSelect.value));

function setVersion(v: string) {
  version = v;
  versionSelect.value = v;
  try {
    localStorage.setItem("nova-version", v);
  } catch {
    /* stockage indisponible : la version reste en mémoire */
  }
  document.body.dataset.version = v;
  render();
}

function render() {
  const [path, query = ""] = location.hash.replace(/^#/, "").split("?");
  const params = new URLSearchParams(query);
  const parts = path.split("/").filter(Boolean);
  const route = parts[0] ?? "brief";
  // ?v=<version> dans l'URL force une version (lien partageable, impression du brief par version)
  const pv = params.get("v");
  if (pv && pv !== version && available.some((v) => v.id === pv)) {
    version = pv;
    versionSelect.value = pv;
  }
  const m = memoryAt(version);
  document.body.dataset.version = version;

  const views: Record<string, () => string> = {
    brief: () => V.viewBrief(m),
    questions: () => V.viewQuestions(m),
    chronologie: () => V.viewTimeline(m, params),
    decisions: () => V.viewDecisions(m),
    dossier: () => V.viewDossier(m),
    contradictions: () => V.viewContradictions(m),
    actions: () => V.viewActions(m, params),
    finances: () => V.viewFinances(m),
    personnes: () => V.viewPeople(m),
    sources: () => V.viewSources(m),
    source: () => V.viewSource(decodeURIComponent(parts[1] ?? ""), params, m),
    recherche: () => V.viewSearch(params),
    chat: () => V.viewChat(),
    "mise-a-jour": () => V.viewUpdates(),
    aide: () => V.viewHelp(),
  };
  app.innerHTML = (views[route] ?? views.brief)();
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#/${route}`));

  // ?noscroll=1 : pas de défilement automatique (captures d'écran en mode headless)
  if (params.get("noscroll")) window.scrollTo(0, 0);
  else if (route === "source") document.querySelector("[data-hl]")?.scrollIntoView({ block: "center" });
  else if (params.get("d")) document.getElementById(params.get("d")!)?.scrollIntoView();
  else window.scrollTo(0, 0);
  bind(route);
}

function bind(route: string) {
  document.querySelectorAll<HTMLAnchorElement>(".switch-version").forEach((a) =>
    a.addEventListener("click", () => setVersion(a.dataset.version!)),
  );
  if (route === "recherche") {
    document.getElementById("search-form")!.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(e.target as HTMLFormElement).get("q");
      location.hash = `#/recherche?q=${encodeURIComponent(String(q))}`;
    });
  }
  if (route === "chat") bindChat();
  if (route === "mise-a-jour") bindEventForm();
}

// ───────────── Chat ─────────────
type Turn = { role: "user" | "assistant"; content: string };
const history: Turn[] = [];
// Réponses servies depuis le cache serveur (aucun quota consommé), par index dans l'historique
const fromCache = new Set<number>();
// Réponses pré-enregistrées (aucun appel réseau), par index dans l'historique
const fromPrecomputed = new Set<number>();

function bindChat() {
  const log = document.getElementById("chat-log")!;
  const form = document.getElementById("chat-form") as HTMLFormElement;
  const input = form.querySelector("input")!;
  const paint = () => {
    log.innerHTML = history
      .map((t, i) => `<div class="msg msg-${t.role}">${t.role === "user" ? esc(t.content) : linkifyCitations(t.content)}${fromCache.has(i) ? `<div class="cache-tag">⚡ réponse en cache : aucun quota consommé</div>` : ""}${fromPrecomputed.has(i) ? `<div class="cache-tag">📌 réponse pré-enregistrée (générée à l'avance avec le même modèle)</div>` : ""}</div>`)
      .join("");
    log.scrollTop = log.scrollHeight;
  };
  paint();
  const ask = async (q: string) => {
    if (!q.trim()) return;
    history.push({ role: "user", content: q });
    history.push({ role: "assistant", content: "…" });
    paint();
    // Première question identique à une question d'exemple : réponse pré-enregistrée, sans appel réseau
    const pre = history.length === 2 ? precomputedAnswer(version, q) : undefined;
    if (pre) {
      history[history.length - 1].content = pre.answer;
      fromPrecomputed.add(history.length - 1);
      paint();
      return;
    }
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, messages: history.slice(0, -1) }),
      });
      const data = await res.json();
      history[history.length - 1].content = res.ok ? data.answer : `⚠ ${data.error ?? res.statusText}`;
      if (res.ok && data.cached) fromCache.add(history.length - 1);
    } catch {
      history[history.length - 1].content = import.meta.env.VITE_CHAT_URL
        ? "⚠ Le service de chat ne répond pas pour le moment. Les questions d'exemple restent disponibles (réponses pré-enregistrées), ainsi que les pages Questions, Recherche et Sources."
        : "⚠ Chat indisponible dans cet export hors ligne (il nécessite `npm run dev` et une clé API). Les questions d'exemple restent disponibles (réponses pré-enregistrées), ainsi que les pages Questions, Recherche et Sources.";
    }
    paint();
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  });
  document.querySelectorAll<HTMLButtonElement>(".example").forEach((b) => b.addEventListener("click", () => ask(b.textContent ?? "")));
}

// ───────────── Nouvel événement (mode dev) ─────────────
function bindEventForm() {
  const form = document.getElementById("event-form") as HTMLFormElement | null;
  const save = document.getElementById("event-save") as HTMLFormElement | null;
  const status = document.getElementById("event-status");
  if (!form || !save || !status) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    status.textContent = "Ingestion et analyse d'impact en cours (≈ 30 s)…";
    const res = await fetch("api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
    const data = await res.json();
    if (!res.ok) {
      status.textContent = `⚠ ${data.error}`;
      return;
    }
    status.innerHTML = `Source ingérée : <a href="#/source/${encodeURIComponent(data.sourceId)}">${esc(data.sourceId)}</a>. Relisez le brouillon ci-dessous : aucune approbation ne doit être inventée.`;
    save.hidden = false;
    (save.elements.namedItem("json") as HTMLTextAreaElement).value = JSON.stringify(data.draft, null, 2);
  });
  save.addEventListener("submit", async (e) => {
    e.preventDefault();
    const json = (save.elements.namedItem("json") as HTMLTextAreaElement).value;
    const res = await fetch("api/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: json });
    const data = await res.json();
    status.textContent = res.ok ? `✓ Version ${data.version} enregistrée (${data.file}). La page va se recharger.` : `⚠ ${data.error}`;
  });
}

window.addEventListener("hashchange", render);
render();
