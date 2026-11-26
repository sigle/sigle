import type { Page } from "@playwright/test";
import { publishDraft, startDraft, writeDraft } from "./editor";
import { expect, test } from "./fixtures";

/** Posts an account on the Free plan can publish a day, see `PUBLISH_LIMITS`. */
const FREE_DAILY_PUBLISHES = 3;

const publishStory = async (page: Page, title: string): Promise<void> => {
  await startDraft(page);
  await writeDraft(page, { title, content: `The content of ${title}.` });
  await publishDraft(page);
};

test.describe("free plan", () => {
  test("offers Pro once the daily publish limit is reached", async ({
    page,
    signIn,
  }) => {
    // Three publishes, each waiting on the autosave and the publish job.
    test.slow();

    await page.goto("/");
    await signIn();
    await publishStory(page, "First story of the day");
    await publishStory(page, "Second story of the day");
    await publishStory(page, "Third story of the day");

    await startDraft(page);

    await writeDraft(page, {
      title: "One story too many",
      content: "The fourth story of the day has to wait.",
    });

    await page.getByRole("button", { name: "Publish", exact: true }).click();

    const dialog = page.getByRole("dialog", { name: "Ready to publish?" });

    await expect(dialog.getByText("Daily publish limit reached")).toBeVisible();

    await expect(
      dialog.getByText(
        `You published ${FREE_DAILY_PUBLISHES} posts in the last 24 hours.`,
      ),
    ).toBeVisible();

    await expect(
      dialog.getByRole("button", { name: "Publish", exact: true }),
    ).toBeDisabled();

    // The prompt opens the plan page in a new tab, keeping the draft open.
    const planPage = page.waitForEvent("popup");
    await dialog.getByRole("button", { name: "Upgrade to Pro" }).click();

    await expect(
      (await planPage).getByRole("heading", { name: "Unlock Pro" }),
    ).toBeVisible();
  });

  test("offers Pro for a cover image", async ({ page, signIn }) => {
    await page.goto("/");
    await signIn();
    await startDraft(page);

    await page.getByRole("button", { name: "Add cover image" }).click();

    const dialog = page.getByRole("dialog", {
      name: "Add a cover image with Pro",
    });

    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByRole("button", { name: "Upgrade to Pro" }),
    ).toHaveAttribute("href", "/dashboard/plan");
  });
});
