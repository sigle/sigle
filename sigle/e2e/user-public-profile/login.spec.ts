import { test, expect } from '@playwright/test';

test('match snapshot', async ({ page }) => {
  await page.goto('/sigle.btc');

  await expect(page).toHaveScreenshot('user-public-profile.png');
});
