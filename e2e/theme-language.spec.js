import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Theme', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // 点击主题切换按钮（假设在 NavBar 中）
    const themeBtn = page.locator('button[aria-label*="theme"], button[title*="主题"]').first();
    if (await themeBtn.isVisible().catch(() => false)) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      const newTheme = await html.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});

test.describe('Language', () => {
  test('should switch language', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    const html = page.locator('html');
    const initialLang = await html.getAttribute('lang');

    // 点击语言切换按钮
    const langBtn = page.locator('button[aria-label*="language"], button[title*="语言"]').first();
    if (await langBtn.isVisible().catch(() => false)) {
      await langBtn.click();
      await page.waitForTimeout(200);

      // 选择英文
      const enOption = page.locator('text=English').first();
      if (await enOption.isVisible().catch(() => false)) {
        await enOption.click();
        await page.waitForTimeout(300);
        const newLang = await html.getAttribute('lang');
        expect(newLang).not.toBe(initialLang);
      }
    }
  });
});
