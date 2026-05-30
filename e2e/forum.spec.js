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
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('h1')).toContainText('TalentPro Community');
  });

  test('should show loading or empty state', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    // Check that at least one content area is present
    const hasContent = await page.locator('.topic-list, .forum-empty').count();
    expect(hasContent).toBeGreaterThan(0);
  });
});
