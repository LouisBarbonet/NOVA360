// Répétition sans quota : installe la répétition 2 déjà validée (courriel + pièces jointes + U1), ou remet le baseline.
// Usage : npm run repetition:charger   |   npm run repetition:reset
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const EVENT_DIR = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement";
const REP = "repetitions/repetition-2";
const tsx = (script: string) => execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", script], { stdio: "inherit" });

function reset() {
  for (const p of [EVENT_DIR, "data/transcriptions/09_Nouvel_evenement", "public/corpus/09_Nouvel_evenement", "data/memory/updates"]) {
    rmSync(p, { recursive: true, force: true });
  }
  // Corpus d'origine, tel que versionné (évite un fichier modifié par la date de génération)
  execFileSync("git", ["checkout", "--", "data/corpus.json"], { stdio: "inherit" });
  console.log("✓ Baseline rétabli : aucun événement, aucune mise à jour. Rechargez la page.");
}

function load() {
  reset();
  mkdirSync(EVENT_DIR, { recursive: true });
  cpSync(`${REP}/Courriel_Olivier_runbook.eml`, `${EVENT_DIR}/EVT-01_Courriel_Olivier_runbook.eml`);
  mkdirSync("data/transcriptions/09_Nouvel_evenement", { recursive: true });
  cpSync(`${REP}/transcription_automatique_PJ1.txt`, "data/transcriptions/09_Nouvel_evenement/EVT-01_Courriel_Olivier_runbook.eml__Runbook_final_capture.png.txt");
  mkdirSync("data/memory/updates", { recursive: true });
  cpSync(`${REP}/U1_gemini_runbook_recu.json`, "data/memory/updates/U1.json");
  tsx("scripts/extract.ts");
  tsx("scripts/validate.ts");
  console.log("✓ Répétition 2 chargée (U1 = runbook reçu, non approuvé). Aucun quota consommé. Rechargez la page, puis : npm run repetition:reset");
}

const cmd = process.argv[2];
if (cmd === "charger") load();
else if (cmd === "reset") reset();
else {
  console.error("Usage : tsx scripts/repetition.ts charger|reset");
  process.exit(1);
}
if (!existsSync("data/corpus.json")) process.exit(1);
