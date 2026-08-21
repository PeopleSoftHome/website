import { test, expect } from '@playwright/test';

test.describe('P1 visual regression', () => {
  test.skip(process.env.VISUAL_REGRESSION !== '1', 'Visual baseline bootstrap is opt-in until checked-in snapshots exist.');

  test('home / nav / hero', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav').waitFor();
    await expect(page.locator('nav')).toHaveScreenshot('nav.png');
    await expect(page.locator('#home')).toHaveScreenshot('hero.png');
    await expect(page).toHaveScreenshot('home.png', { fullPage: true });
  });
});
