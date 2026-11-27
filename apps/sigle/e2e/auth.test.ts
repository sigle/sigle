import { expect, test } from "./fixtures";

test.describe("authentication", () => {
  test("signs in with a wallet and signs out", async ({
    page,
    signIn,
    wallet,
  }) => {
    await page.goto("/");
    await signIn();

    // The session belongs to the wallet that signed the message.
    await page.getByRole("button", { name: "Account menu" }).click();

    await expect(
      page.getByText(
        `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
      ),
    ).toBeVisible();

    await page.getByRole("menuitem", { name: "Log out" }).click();

    await expect(
      page.getByRole("button", { name: "Connect wallet", exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeHidden();
  });

  test("keeps the session across a reload", async ({ page, signIn }) => {
    await page.goto("/");
    await signIn();
    await page.reload();

    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Connect wallet", exact: true }),
    ).toBeHidden();
  });
});
