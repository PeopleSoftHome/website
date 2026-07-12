/**
 * verify-ssg-seo.cjs
 * 原始 HTML 响应级 SEO 回归测试
 * 不执行 JS，直接读取 npm run generate 产物，断言关键页面包含真实内容与 Meta。
 * 用法：node scripts/verify-ssg-seo.cjs [output-dir]
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = process.argv[2] || path.resolve(__dirname, '../.output/public');

const checks = [
  {
    name: 'home',
    file: 'index.html',
    mustContain: [
      '<title>TalentPro',
      '<meta name="description" content="',
      '<meta property="og:title"',
      '<meta property="og:description"',
      'id="__nuxt"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'blog-detail',
    file: path.join('blog', 'ai-recruiting-2026', 'index.html'),
    mustContain: [
      '<title>2026 AI 招聘深度指南',
      '<meta name="description" content="',
      '<meta property="og:title"',
      '<meta property="og:description"',
      '<meta property="og:url"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'case-detail',
    file: path.join('cases', 'bytedance-internet', 'index.html'),
    mustContain: [
      '<title>字节跳动',
      '<meta name="description" content="',
      '<meta property="og:title"',
      '<meta property="og:description"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'news-detail',
    file: path.join('news', 'ai-family-3-launch', 'index.html'),
    mustContain: [
      '<title>',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'product-detail',
    file: path.join('products', 'ai-recruit', 'index.html'),
    mustContain: [
      '<title>AI 招聘助手',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'career-detail',
    file: path.join('careers', 'job-senior-frontend', 'index.html'),
    mustContain: [
      '<title>高级前端工程师',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'forum-detail',
    file: path.join('forum', 'topic', '1', 'index.html'),
    mustContain: [
      '<title>',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: [
      '<div id="__nuxt"></div>',
      'property="og:title" content="TalentPro — forum.detail"',
      'property="og:description" content="forum.subtitle"',
    ],
  },
  {
    name: 'en-home',
    file: path.join('en', 'index.html'),
    mustContain: [
      '<title>TalentPro',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
  {
    name: 'zh-tw-home',
    file: path.join('zh-TW', 'index.html'),
    mustContain: [
      '<title>TalentPro',
      '<meta name="description" content="',
      '<meta property="og:title"',
    ],
    mustNotContain: ['<div id="__nuxt"></div>'],
  },
];

let failed = 0;
let passed = 0;

for (const check of checks) {
  const filePath = path.join(OUTPUT_DIR, check.file);
  const exists = fs.existsSync(filePath);

  if (!exists) {
    console.error(`❌ [${check.name}] missing file: ${filePath}`);
    failed += 1;
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  for (const text of check.mustContain) {
    if (!html.includes(text)) {
      errors.push(`missing: ${text}`);
    }
  }

  for (const text of check.mustNotContain) {
    if (html.includes(text)) {
      errors.push(`unexpected: ${text}`);
    }
  }

  // 额外防御：禁止出现未翻译的 raw i18n key 作为 og:title / og:description
  const rawKeyPatterns = [
    /property="og:title" content="TalentPro — [a-z0-9_.]+"/i,
    /property="og:description" content="[a-z0-9_.]+"/i,
  ];
  for (const pattern of rawKeyPatterns) {
    const match = html.match(pattern);
    if (match) {
      errors.push(`raw i18n key in meta: ${match[0]}`);
    }
  }

  if (errors.length > 0) {
    console.error(`❌ [${check.name}] ${check.file}`);
    for (const err of errors) {
      console.error(`   ${err}`);
    }
    failed += 1;
  } else {
    console.log(`✅ [${check.name}] ${check.file}`);
    passed += 1;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
