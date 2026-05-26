import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('should open login modal', async ({ page }) => {
    await page.goto('/');
    await page.click('text=登录');
    await expect(page.locator('text=欢迎回来')).toBeVisible();
  });

  test('should switch to register mode', async ({ page }) => {
    await page.goto('/');
    await page.click('text=登录');
    await page.click('text=立即注册');
    await expect(page.locator('text=创建账号')).toBeVisible();
  });
});
