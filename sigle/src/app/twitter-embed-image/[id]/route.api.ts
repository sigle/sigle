// import { chromium as playwright } from 'playwright-core';
import puppeteer from 'puppeteer';
// import chromium from '@sparticuz/chromium';

// Cache for 1 day
export const revalidate = 86400;

/**
 * Generate a twitter embed image for a given tweet id
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const browser = await puppeteer.launch({
    // args: chromium.args,
    // defaultViewport: chromium.defaultViewport,
    // executablePath: await chromium.executablePath(),
    // headless: chromium.headless,
    headless: 'new',
  });

  const page = await browser.newPage();

  await page.goto(`${process.env.APP_URL}/twitter-embed/${params.id}`);
  const element = await page.$('.react-tweet-theme');
  if (!element) {
    return new Response('Element not found', { status: 404 });
  }
  // const buffer = await page.locator('.react-tweet-theme').screenshot();
  const buffer = await element.screenshot();
  await browser.close();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
