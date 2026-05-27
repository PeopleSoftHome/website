import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Auth', () => {
  test('should open login modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await dismissCookieBanner(page);
    await page.locator('text=Login').first().click();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should switch to register mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await dismissCookieBanner(page);
    await page.locator('text=Login').first().click();
    await page.locator('text=Sign Up').first().click();
    await expect(page.locator('text=Create Account')).toBeVisible();
  });
});
