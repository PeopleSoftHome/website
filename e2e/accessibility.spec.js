import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 无障碍自动化测试（axe-core + Playwright）
 * ─────────────────────────────────────
 * 覆盖首页及主要二级页面的 WCAG 2.1 AA 合规性检查。
 */

const pages = [
  { path: '/', name: 'Home' },
  { path: '/blog', name: 'Blog' },
  { path: '/forum', name: 'Forum' },
  { path: '/products', name: 'Products' },
  { path: '/solutions', name: 'Solutions' },
  { path: '/cases', name: 'Cases' },
  { path: '/resources', name: 'Resources' },
  { path: '/careers', name: 'Careers' },
  { path: '/about', name: 'About' },
  { path: '/about/contact', name: 'Contact' },
];

for (const pageConfig of pages) {
  test(`A11y: ${pageConfig.name} should pass axe-core checks`, async ({ page }) => {
    await page.goto(pageConfig.path);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.skip-link') // Skip Link 在焦点前不可见，axe 可能误判
      .analyze();

    // 仅将 violations 作为附件输出，不直接失败（渐进式改进）
    // 当项目完全合规后，可将 expect 改为直接断言
    expect(accessibilityScanResults.violations).toEqual([]);
  });
}

test('A11y: DemoModal should be accessible when opened', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 打开预约演示弹窗
  const demoBtn = page.locator('header').getByText(/预约演示|预约/).first();
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  }
});

test('A11y: Dark mode should maintain color contrast', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 切换暗色模式
  const themeBtn = page.locator('[data-testid="theme-toggle"], [aria-label*="theme"], [aria-label*="主题"]').first();
  if (await themeBtn.isVisible().catch(() => false)) {
    await themeBtn.click();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  }
});
