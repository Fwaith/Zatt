import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Open Food Facts' newer search service has no CORS headers, so we proxy it
// under /off-search. Production hosts do the same via vercel.json / public/_redirects.
const offSearchProxy = {
  "/off-search": {
    target: "https://search.openfoodfacts.org",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/off-search/, "/search"),
  },
};

export default defineConfig({
  base: "/Track-er/",   // ← replace with your exact repo name
  plugins: [react()],
  server: { proxy: offSearchProxy },
  preview: { proxy: offSearchProxy },
});
