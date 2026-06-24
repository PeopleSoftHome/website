/**
 * E2E 测试辅助函数
 * ────────────────
 * 针对 SPA 静态站点的页面就绪等待
 */

/**
 * 等待应用就绪：等待 Nuxt SPA 完成客户端激活
 * 检查 nav 存在 + #__nuxt 有子元素 + 页面无 500 错误
 */
export async function waitForAppReady(page) {
  await page.waitForSelector('nav', { timeout: 15000 });
  // 等待 Vue 客户端激活完成（#__nuxt 应有子元素）
  await page.waitForFunction(() => {
    const nuxt = document.getElementById('__nuxt');
    return nuxt && nuxt.children.length > 0;
  }, { timeout: 15000 });
  // 确认没有 500 错误页面（检查 Nuxt 错误页面的特定结构，而非包含 500 的任意文本如"5000+ 规则"）
  const has500Error = await page.locator('h1:has-text("500"), [data-testid="error-500"], .nuxt-error-page h1').first().isVisible().catch(() => false);
  if (has500Error) {
    throw new Error('Page rendered with 500 error');
  }
}

export async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const banners = document.querySelectorAll('[class*="_banner_"]');
    banners.forEach(b => b.remove());
  });
  await page.waitForTimeout(200);
}
