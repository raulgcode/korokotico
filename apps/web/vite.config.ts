import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Carga .env para el código del servidor (DIRECTUS_URL, DIRECTUS_TOKEN, ...)
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ""), ...process.env });
  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
