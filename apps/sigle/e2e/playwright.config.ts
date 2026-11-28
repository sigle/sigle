import { defineConfig, devices } from "@playwright/test";
import { API_PORT, API_URL, APP_PORT, APP_URL, WEB_ENV } from "./env";

const isCi = Boolean(process.env.CI);

/**
 * End-to-end tests of the website against a production build of it and the
 * API of `apps/server/src/test/e2e-server.ts`. Playwright starts both for the
 * run and stops them after it: the API keeps its data in memory, so every run
 * starts from an empty database. The website is built beforehand by the
 * `build:e2e` turbo task, which `pnpm e2e` at the root runs first.
 */
export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCi,
  reporter: isCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // The browser resolves no host but this machine: a request to an
          // outside service fails instead of leaving it.
          args: ["--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost"],
        },
      },
    },
  ],
  webServer: [
    {
      name: "api",
      command: "pnpm --filter @sigle/server e2e:server",
      url: `${API_URL}/health`,
      env: {
        PORT: String(API_PORT),
        APP_URL,
        API_URL,
      },
      reuseExistingServer: false,
    },
    {
      name: "web",
      command: `pnpm start --port ${APP_PORT}`,
      url: `${APP_URL}/health`,
      env: WEB_ENV,
      reuseExistingServer: false,
    },
  ],
});
