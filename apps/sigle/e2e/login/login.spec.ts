import { test, expect } from '@playwright/test';

test('match snapshot', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveScreenshot('login.png', {
    fullPage: true,
    maxDiffPixels: 50,
  });
});
