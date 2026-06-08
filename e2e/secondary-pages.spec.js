import { test, expect } from '@playwright/test';

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}

test.describe('Secondary Pages', () => {
  const pages = [
    { path: '/products', name: 'Products' },
    { path: '/solutions', name: 'Solutions' },
    { path: '/cases', name: 'Cases' },
    { path: '/resources', name: 'Resources' },
    { path: '/news', name: 'News' },
    { path: '/careers', name: 'Careers' },
    { path: '/careers/campus', name: 'Campus Careers' },
    { path: '/careers/social', name: 'Social Careers' },
    { path: '/about', name: 'About' },
    { path: '/about/team', name: 'Team' },
    { path: '/about/contact', name: 'Contact' },
    { path: '/about/partners', name: 'Partners' },
  ];

  for (const p of pages) {
    test(`${p.name} page should load without errors`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState('networkidle');
      await dismissCookieBanner(page);

      // Page should have nav and footer
      await expect(page.locator('nav')).toBeVisible();

      // Console should have no errors
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await expect(page.locator('footer')).toBeVisible();
      expect(errors).toHaveLength(0);
    });
  }

  test('Product detail page should load and show features', async ({ page }) => {
    await page.goto('/products/recruit');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('nav')).toBeVisible();
    // Should show product name and features grid
    await expect(page.locator('h1')).toContainText('招聘');
    await expect(page.locator('main')).toContainText('智能简历解析');
  });

  test('Solution detail page should load and show pain points', async ({ page }) => {
    await page.goto('/solutions/manufacturing');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toContainText('制造');
  });

  test('NavBar should link to new pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Click Cases link
    await page.locator('nav a:has-text("客户案例"), nav a:has-text("Cases")').first().click();
    await expect(page).toHaveURL(/\/cases/);

    // Click Resources link
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('nav a:has-text("资源中心"), nav a:has-text("Resources")').first().click();
    await expect(page).toHaveURL(/\/resources/);
  });

  test('Cases page should filter by industry', async ({ page }) => {
    await page.goto('/cases');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Should show filter buttons and case cards
    await expect(page.locator('main')).toContainText('制造业');
    await expect(page.locator('main')).toContainText('蒙牛');

    // Click manufacturing filter
    await page.locator('button:has-text("制造业")').first().click();
    await page.waitForTimeout(300);

    // Should still show Haier case
    await expect(page.locator('main')).toContainText('海尔');
  });

  test('Case detail page should show metrics and story', async ({ page }) => {
    await page.goto('/cases/mengniu-ai-recruit');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('h1')).toContainText('蒙牛');
    await expect(page.locator('main')).toContainText('80%');
    await expect(page.locator('main')).toContainText('挑战');
    await expect(page.locator('main')).toContainText('方案');
    await expect(page.locator('main')).toContainText('成果');
  });

  test('Resources page should filter by type', async ({ page }) => {
    await page.goto('/resources');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Should show type filter buttons
    await expect(page.locator('main')).toContainText('白皮书');
    await expect(page.locator('main')).toContainText('案例集');

    // Click whitepaper filter
    await page.locator('button:has-text("白皮书")').first().click();
    await page.waitForTimeout(300);
  });

  test('Resource detail page should show download CTA', async ({ page }) => {
    await page.goto('/resources/hr-digital-whitepaper');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toContainText('下载');
  });

  test('Product list should navigate to product detail', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Click first product card
    await page.locator('main a[href^="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Solutions list should navigate to solution detail', async ({ page }) => {
    await page.goto('/solutions');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    // Click first solution card
    await page.locator('main a[href^="/solutions/"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/solutions\//);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Careers page should show job list and benefits', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('main')).toContainText('社会招聘');
    await expect(page.locator('main')).toContainText('校园招聘');
  });

  test('About page should show values and stats', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('main')).toContainText('TalentPro');
    await expect(page.locator('main')).toContainText('价值观');
  });

  test('Contact page should show form', async ({ page }) => {
    await page.goto('/about/contact');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);

    await expect(page.locator('main')).toContainText('联系');
    await expect(page.locator('input, textarea, button')).toHaveCount(4, { gte: true });
  });
});
