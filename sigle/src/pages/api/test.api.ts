import { chromium as playwright } from 'playwright-core';
// import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { NextApiHandler } from 'next';

// Cache for 1 day
export const revalidate = 86400;

const healthCheckEndpoint: NextApiHandler = async (_, res) => {
  const id = '1634630749650317314';

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${process.env.APP_URL}/twitter-embed/${id}`);
  const buffer = await page.locator('.react-tweet-theme').screenshot();
  await browser.close();

  res.setHeader('Content-Type', 'image/png');
  res.end(buffer);
};

export default healthCheckEndpoint;
