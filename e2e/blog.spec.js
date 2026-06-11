import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Blog', () => {
  test('should display blog list page', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    await expect(page.locator('h1')).toContainText('TalentPro');
  });

  test('should show page structure', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    // Blog page uses client-side API; just verify the page renders without errors
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
