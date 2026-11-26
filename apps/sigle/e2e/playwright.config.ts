import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env.CI);

// Ports of their own, so the suite runs next to the development servers.
const APP_PORT = 3100;

const API_PORT = 3101;

const APP_URL = `http://localhost:${APP_PORT}`;

const API_URL = `http://localhost:${API_PORT}`;

/**
 * End-to-end tests of the website against a production build of it and the
 * API of `apps/server/src/test/e2e-server.ts`. Playwright starts both for the
 * run and stops them after it: the API keeps its data in memory, so every run
 * starts from an empty database.
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
      // `E2E_SKIP_BUILD=1` serves the build of the previous run.
      command: `${process.env.E2E_SKIP_BUILD ? "" : "pnpm build && "}pnpm start --port ${APP_PORT}`,
      url: `${APP_URL}/health`,
      env: {
        NEXT_PUBLIC_APP_URL: APP_URL,
        NEXT_PUBLIC_API_URL: API_URL,
        NEXT_PUBLIC_STACKS_ENV: "testnet",
        // Server-side reads reach the API on its private domain, as on
        // Railway, see the e2e server.
        API_INTERNAL_URL: `http://127.0.0.1:${API_PORT}`,
        // Public URL of the test storage of the API, which keeps no file.
        CDN_URL: "https://cdn.test",
        // No analytics, whatever a local env file sets.
        NEXT_PUBLIC_POSTHOG_KEY: "",
      },
      timeout: 300_000,
      reuseExistingServer: false,
    },
  ],
});
