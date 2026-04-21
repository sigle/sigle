import { beforeAll } from "vitest";

beforeAll(async () => {
  const { injectServerUrl } = await import("nitro-test-utils/e2e");
  const serverUrl = injectServerUrl();
  const maxAttempts = 30;
  const delay = 500;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${serverUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Nitro server did not become ready in time");
});
