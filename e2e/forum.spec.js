import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Forum', () => {
  test('should display forum list page', async ({ page }) => {
    await page.goto('/forum');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    await expect(page.locator('h1')).toContainText('TalentPro');
  });

  test('should show page structure', async ({ page }) => {
    await page.goto('/forum');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    // Forum page uses client-side API; just verify the page renders without errors
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
