import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { novaApi } from "./server/api";

export default defineConfig(({ mode }) => {
  // Rend ANTHROPIC_API_KEY / NOVA_MODEL du fichier .env disponibles pour l'API locale
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    base: "./",
    plugins: [novaApi(), viteSingleFile()],
    server: { watch: { ignored: ["**/NOVA_ETUDIANTS/**", "**/.cache/**"] } },
  };
});
