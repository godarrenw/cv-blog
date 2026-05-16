import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    screenshot: "only-on-failure",
    video: "off",
    browserName: "chromium",
  },
  projects: [
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 667 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "tablet",
      use: {
        browserName: "chromium",
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "npm run preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
