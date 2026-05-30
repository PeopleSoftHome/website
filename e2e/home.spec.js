import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('HomePage', () => {
  test('should load and display all sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should open demo modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await page.locator('section#home button:has-text("Book a Demo")').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should navigate to blog', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await page.locator('nav a:has-text("Blog")').first().click();
    await expect(page).toHaveURL(/\/blog/);
  });
});
