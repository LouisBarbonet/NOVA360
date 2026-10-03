// Liste les modèles Gemini accessibles avec GEMINI_API_KEY (pour choisir GEMINI_MODEL).
// Usage : npm run gemini:models
import { GoogleGenAI } from "@google/genai";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
if (!env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY absente du fichier .env");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
for await (const m of await ai.models.list()) {
  if (m.supportedActions?.includes("generateContent")) console.log(`${m.name?.replace(/^models\//, "")}\t${m.inputTokenLimit ?? "?"} tokens en entrée`);
}
