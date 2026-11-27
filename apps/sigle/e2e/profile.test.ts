import type { Locator, Page } from "@playwright/test";
import { join } from "node:path";
import { expect, test } from "./fixtures";

const profile = {
  name: "Ada Writer",
  bio: "Writes about engines, mostly analytical ones.",
  website: "https://ada.example",
  twitter: "adawrites",
};

/** A PNG of the website, uploaded as the profile picture. */
const picturePath = join(
  import.meta.dirname,
  "../public/images/icon-192x192.png",
);

const openSettings = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await page.waitForURL("/dashboard/settings");
};

/** The browser decoded the image: it is displayed, not a broken image. */
const expectImageLoaded = async (image: Locator): Promise<void> => {
  await expect(image).toBeVisible();

  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
};

test.describe("profile settings", () => {
  test("edits the profile shown on the blog", async ({
    page,
    signIn,
    wallet,
  }) => {
    await page.goto("/");
    await signIn();
    await openSettings(page);

    await expect(page.getByText("No name yet")).toBeVisible();

    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByLabel("Name").fill(profile.name);
    await page.getByLabel("Bio").fill(profile.bio);
    await page.getByLabel("Website").fill(profile.website);
    await page.getByLabel("X (Twitter)").fill(profile.twitter);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Profile updated!")).toBeVisible();
    await expect(page.getByText(profile.name)).toBeVisible();
    await expect(page.getByText(profile.bio)).toBeVisible();

    // Stored by the API, not only kept in the page.
    await page.reload();

    await expect(page.getByText(profile.name)).toBeVisible();
    await expect(page.getByText(profile.bio)).toBeVisible();

    await page.goto(`/u/${wallet.address}`);

    await expect(
      page.getByRole("heading", { level: 1, name: profile.name }),
    ).toBeVisible();

    await expect(page.getByText(profile.bio)).toBeVisible();

    await expect(
      page.getByRole("link", { name: `@${profile.twitter}` }),
    ).toHaveAttribute("href", `https://x.com/${profile.twitter}`);

    await expect(
      page.getByRole("link", { name: "ada.example" }),
    ).toHaveAttribute("href", profile.website);
  });

  test("uploads a profile picture", async ({ page, signIn, wallet }) => {
    await page.goto("/");
    await signIn();
    await openSettings(page);
    await page.getByRole("button", { name: "Edit", exact: true }).click();

    const fileChooser = page.waitForEvent("filechooser");
    await page.getByText("Upload picture").click();
    await (await fileChooser).setFiles(picturePath);

    await expect(page.getByText("Picture updated!")).toBeVisible();
    await expect(page.getByText("Replace picture")).toBeVisible();

    // The form shows the stored picture itself, the other avatars go through
    // the image optimizer of Next.js.
    await expectImageLoaded(page.getByRole("img", { name: "Profile image" }));

    await expectImageLoaded(
      page.getByRole("button", { name: "Account menu" }).getByRole("img"),
    );

    await page.goto(`/u/${wallet.address}`);

    // The avatar of the profile, below the one of the account menu.
    const avatars = page.getByRole("img", { name: wallet.address });

    await expect(avatars).toHaveCount(2);
    await expectImageLoaded(avatars.last());
  });
});
