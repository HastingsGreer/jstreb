import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Trebuchet Designer tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: "npx vite",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
