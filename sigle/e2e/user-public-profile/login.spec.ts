import { test, expect } from '@playwright/test';

test('match snapshot', async ({ page }) => {
  await page.goto('/leopradel.btc');

  await expect(page).toHaveScreenshot('user-public-profile.png', {
    fullPage: true,
  });
});
