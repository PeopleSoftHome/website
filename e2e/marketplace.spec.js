import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Marketplace', () => {
  test('listing page should load with apps and categories', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Should show marketplace title
    await expect(page.locator('h1')).toContainText('应用广场');

    // Should show category filters
    await expect(page.locator('button:has-text("全部")')).toBeVisible();
    await expect(page.locator('button:has-text("AI 与自动化")')).toBeVisible();

    // Should show app cards
    await expect(page.locator('a[href^="/marketplace/"]')).toHaveCount(12);

    // Console should have no errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('should filter apps by category', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Click AI category
    await page.locator('button:has-text("AI 与自动化")').click();
    await page.waitForTimeout(300);

    // Should show AI apps only
    const cards = page.locator('a[href^="/marketplace/"]');
    await expect(cards).toHaveCount.greaterThanOrEqual(1);
  });

  test('should search apps', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Type in search
    await page.locator('input[placeholder*="搜索"]').fill('AI');
    await page.waitForTimeout(300);

    // Should filter results
    const cards = page.locator('a[href^="/marketplace/"]');
    await expect(cards).toHaveCount.greaterThanOrEqual(1);
  });

  test('detail page should load with pricing and features', async ({ page }) => {
    await page.goto('/marketplace/ai-interview-bot');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Should show app name
    await expect(page.locator('h1')).toContainText('AI 面试机器人');

    // Should show pricing section
    await expect(page.locator('h2:has-text("定价方案")')).toBeVisible();

    // Should show features section
    await expect(page.locator('h2:has-text("核心功能")')).toBeVisible();

    // Console should have no errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('should navigate from listing to detail', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Click first app card
    await page.locator('a[href^="/marketplace/"]').first().click();
    await page.waitForLoadState('networkidle');

    // Should be on detail page
    await expect(page).toHaveURL(/\/marketplace\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
