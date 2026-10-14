import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Track-er/",   // ← replace with your exact repo name
  plugins: [react()],
});
