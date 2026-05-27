/**
 * prerender.js — 构建时预渲染注入
 *
 * 解决 CSR SPA 的 SEO 硬伤：
 *   1. 读取构建后的 dist/index.html
 *   2. 从 zh-CN.json 提取关键文本内容
 *   3. 生成语义化静态 HTML 注入 <div id="root">
 *   4. 搜索引擎爬虫无需执行 JS 即可索引内容
 *
 * 用法：npm run build （已在 package.json build 脚本中串联）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const htmlPath = path.join(distDir, 'index.html');
const zhPath = path.join(__dirname, '../src/i18n/locales/zh-CN.json');

function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error('[prerender] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const zh = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
  let html = fs.readFileSync(htmlPath, 'utf-8');

  const sections = [
    {
      tag: 'h1',
      title: `${zh.hero.title1}${zh.hero.titleAI}${zh.hero.title2}${zh.hero.titleLine2}`,
      subtitle: zh.hero.subtitle,
      badge: zh.hero.badge,
    },
    {
      tag: 'h2',
      title: zh.products.sectionTitle,
      subtitle: zh.products.sectionSub,
    },
    {
      tag: 'h2',
      title: zh.aiFamily.sectionTitle,
      subtitle: zh.aiFamily.sectionSub,
    },
    {
      tag: 'h2',
      title: zh.industry.sectionTitle,
      subtitle: zh.industry.sectionSub,
    },
    {
      tag: 'h2',
      title: zh.whyUs.sectionTitle,
      subtitle: zh.whyUs.sectionSub,
    },
    {
      tag: 'h2',
      title: zh.resources.sectionTitle,
    },
    {
      tag: 'h2',
      title: zh.cta.title,
      subtitle: zh.cta.sub,
    },
  ];

  // 提取产品列表
  const productNames = Object.values(zh.products.items)
    .slice(0, 8)
    .map((p) => `<li>${p.name} — ${p.desc}</li>`)
    .join('\n        ');

  // 提取 AI 卡片
  const aiCards = Object.values(zh.aiFamily.cards)
    .map((c) => `<li>${c.name}：${c.tagline}</li>`)
    .join('\n        ');

  // 提取 stats
  const stats = Object.entries(zh.stats)
    .map(([k, v]) => `<span>${v}</span>`)
    .join(' · ');

  const prerenderHtml = `
<!-- ════════════════════════════════════════════════
     Prerendered content for SEO / crawlers / no-JS
     Vue will hydrate and replace this on load.
     ════════════════════════════════════════════════ -->
<article style="display:none;visibility:hidden;position:absolute;left:-9999px;" aria-hidden="true">
  <header>
    <p>${zh.hero.badge}</p>
    <h1>${zh.hero.title1}${zh.hero.titleAI}${zh.hero.title2}${zh.hero.titleLine2}</h1>
    <p>${zh.hero.subtitle}</p>
    <div>${stats}</div>
  </header>

  <section>
    <h2>${zh.marquee.label}</h2>
  </section>

  <section>
    <h2>${zh.products.sectionTitle}</h2>
    <p>${zh.products.sectionSub}</p>
    <ul>${productNames}</ul>
  </section>

  <section>
    <h2>${zh.aiFamily.sectionTitle}</h2>
    <p>${zh.aiFamily.sectionSub}</p>
    <ul>${aiCards}</ul>
  </section>

  <section>
    <h2>${zh.industry.sectionTitle}</h2>
    <p>${zh.industry.sectionSub}</p>
  </section>

  <section>
    <h2>${zh.testimonials.sectionTitle}</h2>
  </section>

  <section>
    <h2>${zh.logoWall.title}</h2>
  </section>

  <section>
    <h2>${zh.whyUs.sectionTitle}</h2>
    <p>${zh.whyUs.sectionSub}</p>
  </section>

  <section>
    <h2>${zh.resources.sectionTitle}</h2>
  </section>

  <section>
    <h2>${zh.cta.title}</h2>
    <p>${zh.cta.sub}</p>
  </section>

  <footer>
    <p>${zh.footer.desc}</p>
  </footer>
</article>
`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${prerenderHtml}</div>`
  );

  fs.writeFileSync(htmlPath, html);
  console.log('[prerender] Injected semantic HTML into dist/index.html');
}

main();
