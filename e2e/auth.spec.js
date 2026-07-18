import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Auth', () => {
  test('should open login modal', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    // Use evaluate to click because the sticky header button can be outside viewport in some scroll states
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /登录|Login/.test(b.textContent));
      if (btn) btn.click();
    });
    await expect(page.getByText(/欢迎回来|Welcome Back/)).toBeVisible({ timeout: 10000 });
  });

  test('should switch to register mode', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /登录|Login/.test(b.textContent));
      if (btn) btn.click();
    });
    await page.getByText(/注册|Sign Up/).first().click({ force: true });
    await expect(page.getByText(/创建账号|Create Account/)).toBeVisible({ timeout: 10000 });
  });
});
