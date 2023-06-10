import { chromium } from 'playwright';

// Cache for 1 day
export const revalidate = 86400;

/**
 * Generate a twitter embed image for a given tweet id
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${process.env.APP_URL}/twitter-embed/${params.id}`);
  const buffer = await page.locator('.react-tweet-theme').screenshot();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
