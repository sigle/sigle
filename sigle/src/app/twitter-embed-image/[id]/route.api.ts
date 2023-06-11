import { chromium as playwright } from 'playwright';
// import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Cache for 1 day
export const revalidate = 86400;

/**
 * Generate a twitter embed image for a given tweet id
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v110.0.1/chromium-v110.0.1-pack.tar'
    ),
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${process.env.APP_URL}/twitter-embed/${params.id}`);
  const buffer = await page.locator('.react-tweet-theme').screenshot();
  await browser.close();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
