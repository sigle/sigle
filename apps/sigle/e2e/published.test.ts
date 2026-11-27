import type { Page } from "@playwright/test";
import { publishDraft, startDraft, titleField, writeDraft } from "./editor";
import { expect, test } from "./fixtures";

const story = {
  title: "A story to take down",
  content: "Published first, then hidden by its author.",
};

/** Publishes `story` and returns the id of the post, with its page open. */
const publishStory = async (page: Page): Promise<string> => {
  await startDraft(page);
  await writeDraft(page, story);
  await publishDraft(page);

  return new URL(page.url()).pathname.split("/").at(-1) ?? "";
};

const storyHeading = (page: Page) =>
  page.getByRole("heading", { level: 1, name: story.title });

const notFoundHeading = (page: Page) =>
  page.getByRole("heading", { level: 1, name: "This page doesn’t exist" });

test.describe("published stories", () => {
  test("hides a story from its page, its link and the profile", async ({
    page,
    signIn,
    wallet,
  }) => {
    await page.goto("/");
    await signIn();
    const postId = await publishStory(page);

    await page.getByRole("button", { name: "Story actions" }).click();
    await page.getByRole("menuitem", { name: "Hide story" }).click();

    await page
      .getByRole("dialog", { name: "Hide this story?" })
      .getByRole("button", { name: "Hide story" })
      .click();

    // The author lands on their published stories, where it is marked hidden.
    await page.waitForURL("/dashboard/published");

    const row = page.getByRole("listitem").filter({ hasText: story.title });
    await expect(row.getByText("Hidden", { exact: true })).toBeVisible();

    // Its link shows the not found page. Next.js streams the page, so the
    // status of the response is 200 for a browser.
    await page.goto(`/p/${postId}`);

    await expect(notFoundHeading(page)).toBeVisible();
    await expect(storyHeading(page)).toBeHidden();

    await page.goto(`/u/${wallet.address}`);

    // The profile of the author is back to its empty state.
    await expect(
      page.getByRole("heading", { name: "Write your first story" }),
    ).toBeVisible();

    await expect(page.getByText(story.title)).toBeHidden();
  });

  test("shows a hidden story again from the dashboard", async ({
    page,
    signIn,
  }) => {
    await page.goto("/");
    await signIn();
    const postId = await publishStory(page);

    await page.goto("/dashboard/published");

    const row = page.getByRole("listitem").filter({ hasText: story.title });
    await row.getByRole("button", { name: "Story actions" }).click();
    await page.getByRole("menuitem", { name: "Hide story" }).click();

    await page
      .getByRole("dialog", { name: "Hide this story?" })
      .getByRole("button", { name: "Hide story" })
      .click();

    await expect(row.getByText("Hidden", { exact: true })).toBeVisible();

    await row.getByRole("button", { name: "Story actions" }).click();
    await page.getByRole("menuitem", { name: "Show on blog" }).click();

    await expect(page.getByText("Story shown on your blog")).toBeVisible();
    await expect(row.getByText("Hidden", { exact: true })).toBeHidden();

    await row.getByRole("link", { name: story.title }).click();
    await page.waitForURL(`/p/${postId}`);

    await expect(storyHeading(page)).toBeVisible();
    await expect(page.getByText(story.content)).toBeVisible();
  });

  // The app cannot update a published story yet: publishing deletes the draft
  // and the API has no route to change a post, so the "Edit" action of the
  // author opens the error page. This test is the first step of an update,
  // and is expected to fail until stories can be edited. It then fails as
  // "passed unexpectedly": drop the `fail` and extend it to the whole update.
  test.fail(
    "opens a published story in the editor",
    async ({ page, signIn, wallet }) => {
      await page.goto("/");
      await signIn();
      await publishStory(page);

      await page.goto(`/u/${wallet.address}`);
      await page.getByRole("button", { name: "Post actions" }).click();
      await page.getByRole("menuitem", { name: "Edit" }).click();

      await expect(titleField(page)).toHaveValue(story.title);
    },
  );
});
