import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Search', () => {
  test('should open search modal with Cmd+K', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    await page.keyboard.press('Control+k');
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
  });

  test('should search and navigate to results', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    await page.keyboard.press('Control+k');
    const input = page.locator('[role="dialog"] input');
    await expect(input).toBeVisible();
    await input.fill('AI');
    await page.waitForTimeout(300);

    const firstResult = page.locator('[role="dialog"] [class*="resultItem"]').first();
    await expect(firstResult).toBeVisible();
  });
});
