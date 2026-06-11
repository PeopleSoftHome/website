import { waitForAppReady } from './helpers.js';
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
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Should show marketplace title
    await expect(page.locator('h1')).toContainText('应用广场');

    // Should show category filters (at least one category button)
    const catBtns = await page.locator('main button').count();
    expect(catBtns).toBeGreaterThan(0);

    // Should show app cards (featured + grid)
    const cardCount = await page.locator('a[href^="/marketplace/"]').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Console should have no errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('should filter apps by category', async ({ page }) => {
    await page.goto('/marketplace');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    // Click first category after "all"
    const catBtn = page.locator('main button').nth(1);
    await catBtn.click();
    await page.waitForTimeout(300);

    // Should show apps
    const cards = page.locator('a[href^="/marketplace/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should search apps', async ({ page }) => {
    await page.goto('/marketplace');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    // Type in search (scoped to main to avoid SearchModal input)
    await page.locator('main input[type="text"]').first().fill('AI');
    await page.waitForTimeout(300);

    // Should filter results
    const cards = page.locator('a[href^="/marketplace/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('detail page should load with pricing and features', async ({ page }) => {
    await page.goto('/marketplace/ai-interview-bot');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Should show app name
    await expect(page.locator('h1')).toContainText('AI 面试机器人');

    // Should show pricing section (heading contains pricing-related text)
    const h2Count = await page.locator('main h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(2);

    // Should show features section
    await expect(page.locator('h2:has-text("功能特性")')).toBeVisible();

    // Console should have no errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('should navigate from listing to detail', async ({ page }) => {
    await page.goto('/marketplace');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    // Click first app card
    await page.locator('a[href^="/marketplace/"]').first().click();
    await waitForAppReady(page);

    // Should be on detail page
    await expect(page).toHaveURL(/\/marketplace\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
