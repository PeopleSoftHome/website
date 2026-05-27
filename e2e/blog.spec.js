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
    await page.waitForTimeout(2000);
    await dismissCookieBanner(page);
    await expect(page.locator('h1')).toContainText('TalentPro Blog');
  });

  test('should show loading or empty state', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForTimeout(2000);
    await dismissCookieBanner(page);
    // Either posts, skeleton, or empty state should be present
    const hasContent = await page.locator('.blog-grid, .blog-loading, .blog-empty').count();
    expect(hasContent).toBeGreaterThan(0);
  });
});
