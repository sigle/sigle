import { test, expect } from '@playwright/test';

test('match snapshot', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveScreenshot('home.png', {
    fullPage: true,
  });
});
