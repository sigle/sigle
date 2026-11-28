// Ports of their own, so the suite runs next to the development servers.
export const APP_PORT = 3100;

export const API_PORT = 3101;

export const APP_URL = `http://localhost:${APP_PORT}`;

export const API_URL = `http://localhost:${API_PORT}`;

/**
 * Environment of the website the suite runs against. `pnpm build:e2e` builds
 * it with these values, as Next.js inlines the NEXT_PUBLIC_* ones in the
 * build, and Playwright starts it with them.
 */
export const WEB_ENV = {
  NEXT_PUBLIC_APP_URL: APP_URL,
  NEXT_PUBLIC_API_URL: API_URL,
  NEXT_PUBLIC_STACKS_ENV: "testnet",
  // Server-side reads reach the API on its private domain, as on Railway, see
  // the e2e server.
  API_INTERNAL_URL: `http://127.0.0.1:${API_PORT}`,
  // The API serves the files uploaded to its test storage.
  CDN_URL: `${API_URL}/e2e/storage`,
  // No analytics, whatever a local env file sets.
  NEXT_PUBLIC_POSTHOG_KEY: "",
};
