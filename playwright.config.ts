import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const useExternalServer = process.env.PLAYWRIGHT_USE_EXTERNAL_SERVER === "true";

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
