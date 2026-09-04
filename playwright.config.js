import { defineConfig } from "@playwright/test";

const proxyUrl = process.env.HTTPS_PROXY ? new URL(process.env.HTTPS_PROXY) : null;

export default defineConfig({
  testDir: "./tests",
  timeout: 360_000,
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: process.env.FNF_BASE_URL || "http://127.0.0.1:5180",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    permissions: ["microphone", "camera"],
    launchOptions: {
      proxy: proxyUrl ? {
        server: `${proxyUrl.protocol}//${proxyUrl.hostname}:${proxyUrl.port}`,
        username: decodeURIComponent(proxyUrl.username),
        password: decodeURIComponent(proxyUrl.password),
        bypass: "127.0.0.1,localhost",
      } : undefined,
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--auto-select-desktop-capture-source=Entire screen",
      ],
    },
  },
  webServer: process.env.FNF_BASE_URL ? undefined : {
    command: "npx vite --host 127.0.0.1 --port 5180",
    url: "http://127.0.0.1:5180",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
