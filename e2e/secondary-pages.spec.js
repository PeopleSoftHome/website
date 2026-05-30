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

  test('Product detail page should load', async ({ page }) => {
    await page.goto('/products/recruit');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Solution detail page should load', async ({ page }) => {
    await page.goto('/solutions/manufacturing');
    await page.waitForLoadState('networkidle');
    await dismissCookieBanner(page);
    await expect(page.locator('nav')).toBeVisible();
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
});
