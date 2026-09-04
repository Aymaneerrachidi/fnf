import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { HttpsProxyAgent } from "https-proxy-agent";

const supabaseTarget = "https://rngoiswvuhoqtlfbhxpw.supabase.co";
const livekitTarget = "wss://fnf-zipn1x5s.livekit.cloud";
const outboundProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const supabaseAgent = outboundProxy ? new HttpsProxyAgent(outboundProxy) : undefined;

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
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
    proxy: {
      "/supabase": {
        target: supabaseTarget,
        changeOrigin: true,
        secure: true,
        ws: true,
        agent: supabaseAgent,
        rewrite: (path) => path.replace(/^\/supabase/, ""),
      },
      "/livekit": {
        target: livekitTarget,
        changeOrigin: true,
        secure: true,
        ws: true,
        agent: supabaseAgent,
        rewrite: (path) => path.replace(/^\/livekit/, ""),
      },
    },
    watch: {
      ignored: ["**/audits/**", "**/design/**", "**/new ui direction/**"],
    },
  },
});
