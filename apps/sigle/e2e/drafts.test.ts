import { contentField, startDraft, titleField, writeDraft } from "./editor";
import { expect, test } from "./fixtures";

const draft = {
  title: "A draft that saves itself",
  content: "Written once, and still here after a reload.",
};

test.describe("drafts", () => {
  test("autosaves a new draft, which survives a reload", async ({
    page,
    signIn,
  }) => {
    await page.goto("/");
    await signIn();
    await startDraft(page);
    await writeDraft(page, draft);

    await page.reload();

    await expect(titleField(page)).toHaveValue(draft.title);
    await expect(contentField(page)).toHaveText(draft.content);
  });

  test("reopens a saved draft from the drafts list", async ({
    page,
    signIn,
  }) => {
    await page.goto("/");
    await signIn();
    await startDraft(page);
    await writeDraft(page, draft);

    // Back to the list and into the draft again, without a page load in
    // between: the editor must show what the autosave stored.
    await page.getByRole("link", { name: "Drafts" }).click();

    await expect(page.getByRole("heading", { name: "Drafts" })).toBeVisible();

    const row = page.getByRole("listitem").filter({ hasText: draft.title });
    await row.getByRole("link", { name: draft.title }).click();

    await expect(titleField(page)).toHaveValue(draft.title);
    await expect(contentField(page)).toHaveText(draft.content);
  });
});
