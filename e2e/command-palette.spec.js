import { test, expect } from '@playwright/test';

test.describe('P3 command palette', () => {
  test('opens with Cmd/Ctrl+K and navigates', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Control+KeyK');
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search commands' }).fill('pricing');
    await expect(page.getByText('Pricing', { exact: true })).toBeVisible();
  });

  test('Escape closes the palette', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+KeyK');
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
  });
});
