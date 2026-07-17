/**
 * 颜色对比度可访问性审计（手动工具，非 CI）
 *
 * 前置条件：
 *   1. npm run build
 *   2. node scripts/e2e-server.cjs .output/public 9876（另开终端保持运行）
 * 用法：npm run audit:contrast
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

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

const baseURL = 'http://localhost:9876';

function waitForAppReady(page) {
  return page.waitForFunction(() => {
    const nuxt = document.getElementById('__nuxt');
    return document.querySelector('nav') && nuxt && nuxt.children.length > 0;
  }, { timeout: 15000 });
}

const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();

for (const { path, name } of pages) {
  await page.goto(`${baseURL}${path}`);
  await waitForAppReady(page);
  await page.addStyleTag({
    content: `
      * { animation: none !important; transition: none !important; }
      .reveal, .reveal.is-visible { opacity: 1 !important; transform: none !important; }
    `,
  });
  await page.waitForTimeout(200);

  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .exclude('.skip-link')
    .analyze();

  const contrast = result.violations.filter((v) => v.id === 'color-contrast');
  if (contrast.length === 0) {
    console.log(`[PASS] ${name}`);
    continue;
  }
  console.log(`\n[FAIL] ${name} (${contrast[0].nodes.length} nodes)`);
  for (const node of contrast[0].nodes) {
    const data = node.any[0]?.data || {};
    console.log(`  - ${data.fgColor} on ${data.bgColor} ratio=${data.contrastRatio} size=${data.fontSize} html=${node.html.slice(0, 120)}`);
  }
}

await browser.close();
