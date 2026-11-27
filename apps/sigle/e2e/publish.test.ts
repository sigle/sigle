import { publishDraft, startDraft, writeDraft } from "./editor";
import { expect, test } from "./fixtures";

const draft = {
  title: "A story worth publishing",
  content: "It goes from a draft to a public page.",
};

test.describe("publishing", () => {
  test("publishes a draft to its public page", async ({
    context,
    page,
    signIn,
    wallet,
  }) => {
    await page.goto("/");
    await signIn();
    await startDraft(page);
    await writeDraft(page, draft);
    await publishDraft(page);

    await expect(
      page.getByRole("heading", { level: 1, name: draft.title }),
    ).toBeVisible();

    await expect(page.getByText(draft.content)).toBeVisible();

    // Written by the wallet of the test, and stored under its Arweave
    // transaction id, which is the id of the post.
    const postId = new URL(page.url()).pathname.split("/").at(-1) ?? "";

    const author = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

    await expect(
      page.getByRole("link", { name: `More from ${author}` }),
    ).toBeVisible();

    await expect(page.getByText("Stored on Arweave")).toBeVisible();
    await page.getByRole("button", { name: "Verify it yourself" }).click();
    await expect(page.getByTitle(postId)).toBeVisible();

    // The page is public: a visitor without a session reads the same story.
    await context.clearCookies();
    await page.goto(`/p/${postId}`);

    await expect(
      page.getByRole("heading", { level: 1, name: draft.title }),
    ).toBeVisible();

    await expect(page.getByText(draft.content)).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Story actions" }),
    ).toBeHidden();
  });
});
