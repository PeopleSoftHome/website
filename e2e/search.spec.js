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

    // 轮询重试直至弹窗打开（消除应用水合时序依赖；已打开则不重复按键避免来回切换）
    const dialog = page.locator('[role="dialog"]');
    await expect(async () => {
      if (!(await dialog.isVisible().catch(() => false))) {
        await page.keyboard.press('Control+k');
      }
      await expect(dialog).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 10000 });
  });

  test('should search and navigate to results', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    const dialog = page.locator('[role="dialog"]');
    await expect(async () => {
      if (!(await dialog.isVisible().catch(() => false))) {
        await page.keyboard.press('Control+k');
      }
      await expect(dialog).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 10000 });

    const input = page.locator('[role="dialog"] input');
    await expect(input).toBeVisible();
    await input.fill('AI');
    await page.waitForTimeout(300);

    const firstResult = page.locator('[role="dialog"] [class*="resultItem"]').first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });
  });
});
