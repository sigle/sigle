import { test, expect } from '@playwright/test';

test('match snapshot', async ({ page }) => {
  await page.goto('/leopradel.btc/hwkDqwb6TXq2mPPrK0256');

  await expect(page).toHaveScreenshot('public-story.png', {
    fullPage: true,
  });
});
