import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should display blog list', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('博客');
  });

  test('should navigate to blog detail', async ({ page }) => {
    await page.goto('/blog');
    const firstCard = page.locator('.blog-card').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/blog\//);
  });

  test('should show comment section on blog detail', async ({ page }) => {
    await page.goto('/blog');
    const firstCard = page.locator('.blog-card').first();
    if (await firstCard.count() > 0) {
      await firstCard.click();
      await expect(page.locator('text=评论')).toBeVisible();
    }
  });
});
