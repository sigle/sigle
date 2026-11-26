import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** The pages of the dashboard, with the heading each shows once signed in. */
const dashboardPages = [
  { path: "/dashboard", heading: "Dashboard" },
  { path: "/dashboard/drafts", heading: "Drafts" },
  { path: "/dashboard/published", heading: "Published" },
  { path: "/dashboard/plan", heading: "Plan" },
  { path: "/dashboard/settings", heading: "Settings" },
  { path: "/dashboard/migration", heading: "Migration" },
];

const authenticationRequired = (page: Page) =>
  page.getByRole("alert").filter({ hasText: "Authentication required" });

test.describe("signed-out visitors", () => {
  for (const { path, heading } of dashboardPages) {
    test(`are kept out of ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(authenticationRequired(page)).toBeVisible();

      await expect(
        page.getByRole("heading", { level: 2, name: heading }),
      ).toBeHidden();

      // They are offered to sign in, not shown the menu of an account.
      await expect(
        page.getByRole("button", { name: "Connect wallet", exact: true }),
      ).toBeVisible();
    });
  }

  test("are kept out of the editor", async ({ page }) => {
    await page.goto("/p/new");

    await expect(authenticationRequired(page)).toBeVisible();
    // Opening the editor creates a draft and redirects to it.
    await expect(page).toHaveURL("/p/new");
    await expect(page.getByPlaceholder("Title")).toBeHidden();
  });

  test("are kept out of the dashboard again after signing out", async ({
    page,
    signIn,
  }) => {
    await page.goto("/dashboard/settings");
    await signIn();

    await expect(
      page.getByRole("heading", { level: 2, name: "Settings" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();

    await expect(authenticationRequired(page)).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 2, name: "Settings" }),
    ).toBeHidden();
  });
});
