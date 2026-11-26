import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Opens the editor on a new draft, from any page showing the header. */
export const startDraft = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Write a post" }).click();
  // `/p/new` creates the draft, then redirects to its editor.
  await page.waitForURL(/\/p\/[^/]+\/edit$/);
};

export const titleField = (page: Page) => page.getByPlaceholder("Title");

export const contentField = (page: Page) => page.locator(".tiptap");

/**
 * Writes the title and the content of the open draft, and waits for the
 * autosave to store them.
 */
export const writeDraft = async (
  page: Page,
  draft: { readonly title: string; readonly content: string },
): Promise<void> => {
  await titleField(page).fill(draft.title);
  await contentField(page).click();
  await page.keyboard.type(draft.content);

  // Every change shows "Saving…" until the debounced save of the last change
  // answers, so "Saved" after it means the server has all of them.
  await expect(page.getByText("Saving…")).toBeVisible();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
};
