import type { Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import type { TestWallet } from "./wallet";
import { createTestWallet, installWallet, TEST_WALLET_NAME } from "./wallet";

/**
 * Header carrying the client IP of a test, read by the e2e API server, see
 * `apps/server/src/test/e2e-server.ts`.
 */
const CLIENT_IP_HEADER = "x-e2e-client-ip";

/**
 * Hosts the app calls from the browser that the tests leave unreachable: the
 * default avatars come from DiceBear.
 */
const KNOWN_OUTSIDE_HOSTS = new Set(["api.dicebear.com"]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

const isOutsideRequest = (url: string): boolean => {
  const { hostname, protocol } = new URL(url);

  return (
    (protocol === "http:" || protocol === "https:") &&
    !LOCAL_HOSTS.has(hostname) &&
    !KNOWN_OUTSIDE_HOSTS.has(hostname)
  );
};

interface Fixtures {
  /**
   * The wallet installed in the browser, see `installWallet`. Each test has
   * its own, so its own account on the API: tests share no drafts, posts or
   * limits, and can run in any order.
   */
  wallet: TestWallet;
  /** Signs in through the UI with the wallet of the test. */
  signIn: () => Promise<void>;
}

export const test = base.extend<Fixtures>({
  wallet: [
    async ({ context }, provide, testInfo) => {
      // A retry or a repeat starts from a new account too.
      const seed = [
        testInfo.testId,
        testInfo.repeatEachIndex,
        testInfo.retry,
      ].join(":");

      const wallet = createTestWallet(seed);
      await installWallet(context, wallet);

      // The API limits requests per client IP, and every test connects from
      // this machine: each sends an address of its own, derived from its seed.
      const [a = 0, b = 0, c = 0] = createHash("sha256").update(seed).digest();

      await context.setExtraHTTPHeaders({
        [CLIENT_IP_HEADER]: `10.${a}.${b}.${c}`,
      });

      // The browser resolves no outside host (see `playwright.config.ts`), so
      // these requests fail. They still show that the app, or the test,
      // depends on an outside service.
      const outsideRequests: Array<string> = [];

      context.on("request", (request) => {
        if (isOutsideRequest(request.url())) {
          outsideRequests.push(request.url());
        }
      });

      await provide(wallet);

      expect(outsideRequests, "requests to outside services").toStrictEqual([]);
    },
    { auto: true },
  ],
  signIn: async ({ page }, provide) => {
    await provide(() => signInWithWallet(page));
  },
});

/**
 * Signs in from a page showing the header: connects the wallet in the Stacks
 * Connect modal, which then signs the Sign in with Stacks message.
 */
const signInWithWallet = async (page: Page): Promise<void> => {
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();

  await page
    .getByRole("listitem")
    .filter({ hasText: TEST_WALLET_NAME })
    .getByRole("button", { name: "Connect" })
    .click();

  await expect(page.getByText("You are now logged in")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toBeVisible();
};

export { expect } from "@playwright/test";
