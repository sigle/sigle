import { publishDraft, startDraft, writeDraft } from "./editor";
import { expect, test } from "./fixtures";

const story = {
  title: "A story for the feed readers",
  content: "Syndicated to whoever subscribed to this blog.",
};

test.describe("rss feed", () => {
  test("lists the published stories of a profile", async ({
    baseURL,
    page,
    signIn,
    wallet,
  }) => {
    await page.goto("/");
    await signIn();
    await startDraft(page);
    await writeDraft(page, story);
    await publishDraft(page);

    const postId = new URL(page.url()).pathname.split("/").at(-1) ?? "";

    // The profile links to its feed.
    await page.goto(`/u/${wallet.address}`);

    const feedPath = `/api/feed/${wallet.address}`;

    await expect(page.getByRole("link", { name: "RSS" })).toHaveAttribute(
      "href",
      feedPath,
    );

    const response = await page.request.get(feedPath);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/rss+xml");

    const feed = await response.text();

    expect(feed).toContain(`<link>${baseURL}/u/${wallet.address}</link>`);
    expect(feed).toContain(`<title><![CDATA[${story.title}]]></title>`);
    expect(feed).toContain(`<link>${baseURL}/p/${postId}</link>`);
    expect(feed).toContain(story.content);
  });

  test("answers 404 for an address that is not a profile", async ({ page }) => {
    const response = await page.request.get("/api/feed/not-a-stacks-address");

    expect(response.status()).toBe(404);
  });
});
