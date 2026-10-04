// Vérification d'avant-scène : à lancer juste avant de présenter (aucun quota consommé).
// Usage : npm run verif
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SITE = "https://louisbarbonet.github.io/NOVA360/";
const RELAIS = "https://nova360-chat.louis-barbonet.workers.dev/health";
let ok = true;
const check = (label: string, pass: boolean, hint = "") => {
  console.log(`${pass ? "✓" : "✗"} ${label}${pass || !hint ? "" : ` → ${hint}`}`);
  if (!pass) ok = false;
};
const reachable = async (url: string) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(8000) })).ok;
  } catch {
    return false;
  }
};

const env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const provider = env.match(/^NOVA_PROVIDER=(.*)$/m)?.[1]?.trim() || "claude";
check(`Fournisseur LLM : ${provider}`, true);
check("Clé API présente dans .env", provider === "gemini" ? /^GEMINI_API_KEY=.+/m.test(env) : /^ANTHROPIC_API_KEY=.+/m.test(env), "renseigner la clé dans .env");
check("Aucun événement en attente (09_Nouvel_evenement)", !existsSync("NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement"), "npm run repetition:reset");
check("Aucune mise à jour enregistrée (le sélecteur ne montre que le Baseline)", !existsSync("data/memory/updates") || readdirSync("data/memory/updates").length === 0, "npm run repetition:reset");
const dirty = execFileSync("git", ["status", "--porcelain", "data/corpus.json", "data/memory/baseline.json"], { encoding: "utf8" }).trim();
check("Corpus et baseline identiques à la version remise", !dirty, "npm run repetition:reset (ou vérifier les modifications)");
check("Serveur local (npm run dev) sur http://localhost:5173", await reachable("http://localhost:5173/"), "lancer npm run dev dans un terminal");
check(`Site en ligne ${SITE}`, await reachable(SITE));
check("Relais du chat en ligne", await reachable(RELAIS));
check("NOVA360_remise.zip présent", existsSync("NOVA360_remise.zip"), "npm run package");
console.log(ok ? "\nPrêt pour la démo. Ne modifiez plus le .env (le serveur redémarrerait)." : "\nÀ corriger avant de monter sur scène.");
process.exit(ok ? 0 : 1);
