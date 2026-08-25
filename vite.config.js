import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap")) return "gsap";
          if (id.includes("node_modules/motion")) return "motion";
          if (id.includes("node_modules/@phosphor-icons")) return "icons";
          if (id.includes("node_modules/react")) return "react";
          return undefined;
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ["**/audits/**", "**/design/**", "**/new ui direction/**"],
    },
  },
});
