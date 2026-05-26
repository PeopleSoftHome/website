import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
  test('should load and display all sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=TalentPro')).toBeVisible();
    await expect(page.locator('text=预约演示')).toBeVisible();
  });

  test('should open demo modal', async ({ page }) => {
    await page.goto('/');
    await page.click('text=预约演示');
    await expect(page.locator('.modal')).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    await page.click('[aria-label="切换到暗色模式"], [aria-label="切换到亮色模式"]');
    const changed = await html.getAttribute('data-theme');
    expect(changed).not.toBe(initial);
  });

  test('should navigate to blog', async ({ page }) => {
    await page.goto('/');
    await page.click('text=博客');
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator('text=博客')).toBeVisible();
  });
});
