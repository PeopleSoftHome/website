import { test, expect } from '@playwright/test';

test.describe('Forum', () => {
  test('should display forum list', async ({ page }) => {
    await page.goto('/forum');
    await expect(page.locator('h1')).toContainText('社区');
  });

  test('should navigate to topic detail', async ({ page }) => {
    await page.goto('/forum');
    const firstTopic = page.locator('.topic-item').first();
    if (await firstTopic.count() > 0) {
      await firstTopic.click();
      await expect(page).toHaveURL(/\/forum\/topic\//);
    }
  });
});
