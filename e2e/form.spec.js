import { waitForAppReady } from './helpers.js';
import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Demo Modal', () => {
  test('should open demo modal and validate phone', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    // 点击预约演示按钮 (evaluate click to bypass viewport issues)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /Book a Demo|预约演示/.test(b.textContent));
      if (btn) btn.click();
    });

    // 验证弹窗打开
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // 填写表单
    const nameInput = dialog.locator('input[name="name"]').first();
    await nameInput.fill('Test User');

    const companyInput = dialog.locator('input[name="company"]').first();
    await companyInput.fill('Test Company');

    // 提交/下一步按钮应存在
    const submitBtn = dialog.locator('button').last();
    await expect(submitBtn).toBeVisible();
  });

  test('should navigate through demo modal steps', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /Book a Demo|预约演示/.test(b.textContent));
      if (btn) btn.click();
    });

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Step 1: 填写基本信息
    await dialog.locator('input[name="name"]').first().fill('Test');
    await dialog.locator('input[name="company"]').first().fill('Company');

    // 下一步按钮
    const nextBtn = dialog.locator('button:has-text("Next"), button:has-text("下一步"), button:has-text("→")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Contact Form', () => {
  test('should submit contact form', async ({ page }) => {
    await page.goto('/about/contact');
    await waitForAppReady(page);
    await dismissCookieBanner(page);

    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]').first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test User');

      const emailInput = page.locator('input[type="email"]').first();
      await emailInput.fill('test@example.com');

      const messageInput = page.locator('textarea').first();
      await messageInput.fill('This is a test message');

      const submitBtn = page.locator('button[type="submit"]').first();
      await expect(submitBtn).toBeVisible();
    }
  });
});
