#!/usr/bin/env node
/**
 * Token 双源同步校验脚本
 * ─────────────────────────
 * 检查 src/tokens/index.ts 中的 Design Token 是否与 src/styles/global.css 中的
 * CSS 自定义属性保持同步。在 CI 构建前运行，防止视觉回归。
 *
 * 使用方式：
 *   node scripts/validate-tokens-sync.js
 *
 * 退出码：
 *   0 — 校验通过
 *   1 — 发现不一致或遗漏
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/* ── 1. 从 tokens/index.js 提取颜色 Token ── */
const tokensPath = join(root, 'src', 'tokens', 'index.ts');
const tokensSrc = readFileSync(tokensPath, 'utf-8');

const tokenMap = new Map();

// 匹配形如 primary: '#1B5FEB' 或 blackAlpha20: 'rgba(0,0,0,0.20)'
const tokenRegex = /(\w+):\s*['"`]([^'"`]+)['"`]/g;
let m;
while ((m = tokenRegex.exec(tokensSrc)) !== null) {
  const key = m[1];
  const val = m[2].trim();
  // 只关心颜色相关 token（排除 gradients/shadows/animation 等）
  if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb')) {
    tokenMap.set(key, val);
  }
}

/* ── 2. 从 global.css 提取 CSS 变量 ── */
const cssPath = join(root, 'src', 'styles', 'global.css');
const cssSrc = readFileSync(cssPath, 'utf-8');

/* 只提取 :root 块中的变量，排除 [data-theme="dark"] 覆盖 */
const rootBlockMatch = cssSrc.match(/:root\s*\{([\s\S]*?)\}(?!\s*\[data-theme)/);
const rootBlock = rootBlockMatch ? rootBlockMatch[1] : cssSrc;

const cssVarMap = new Map();
const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;
while ((m = cssVarRegex.exec(rootBlock)) !== null) {
  const name = m[1];
  const val = m[2].trim();
  if (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb') || val.startsWith('linear-gradient')) {
    cssVarMap.set(name, val);
  }
}

/* ── 3. 建立 Token → CSS 变量名称的映射 ── */
// 将 camelCase / PascalCase 转换为 kebab-case
function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

const tokenToCssName = (tokenKey) => {
  // 特殊映射表（手动维护，应对不规则命名）
  const specialMap = {
    primary: 'primary',
    primaryDark: 'primary-dark',
    primaryLight: 'primary-light',
    primaryGlow: 'primary-glow',
    ink900: 'ink-900',
    ink800: 'ink-800',
    ink700: 'ink-700',
    gray50: 'gray-50',
    gray100: 'gray-100',
    gray200: 'gray-200',
    gray300: 'gray-300',
    gray350: 'gray-350',
    gray400: 'gray-400',
    gray500: 'gray-500',
    gray600: 'gray-600',
    gray700: 'gray-700',
    gray900: 'gray-900',
    aiPurple: 'ai-purple',
    aiPurpleBg: 'ai-purple-bg',
    aiPurpleLighter: 'ai-purple-lighter',
    aiPurpleLight: 'ai-purple-light',
    aiPurpleText: 'ai-purple-text',
    tagBlueBg: 'tag-blue-bg',
    tagBlueText: 'tag-blue-text',
    videoBg: 'video-bg',
    greenText: 'green-text',
    errorLight: 'error-light',
    errorAlpha15: 'error-alpha-15',
    warningBg: 'warning-bg',
    warningBorder: 'warning-border',
    warningText: 'warning-text',
    primaryAlpha8: 'primary-alpha-8',
    primaryAlpha10: 'primary-alpha-10',
    primaryAlpha12: 'primary-alpha-12',
    primaryAlpha18: 'primary-alpha-18',
    primaryAlpha20: 'primary-alpha-20',
    primaryAlpha30: 'primary-alpha-30',
    primaryAlpha35: 'primary-alpha-35',
    aiPurpleAlpha30: 'ai-purple-alpha-30',
    errorAlpha12: 'error-alpha-12',
    blackAlpha6: 'black-alpha-6',
    blackAlpha8: 'black-alpha-8',
    blackAlpha10: 'black-alpha-10',
    blackAlpha12: 'black-alpha-12',
    blackAlpha18: 'black-alpha-18',
    blackAlpha20: 'black-alpha-20',
    blackAlpha25: 'black-alpha-25',
    blackAlpha30: 'black-alpha-30',
    blackAlpha60: 'black-alpha-60',
    gray500Alpha15: 'gray-500-alpha-15',
    whiteAlpha4: 'white-alpha-4',
    whiteAlpha6: 'white-alpha-6',
    whiteAlpha25: 'white-alpha-25',
    whiteAlpha35: 'white-alpha-35',
    success: 'success',
    error: 'error',
    warning: 'warning',
    orange: 'orange',
    white: 'white',
    black: 'black',
    errorBg: 'error-bg',
  };
  return specialMap[tokenKey] || toKebab(tokenKey);
};

/* ── 4. 校验逻辑 ── */
const mismatches = [];
const missingInCss = [];
const missingInTokens = [];

for (const [tokenKey, tokenVal] of tokenMap) {
  const cssName = tokenToCssName(tokenKey);
  if (!cssName) continue;

  const cssVal = cssVarMap.get(cssName);
  if (!cssVal) {
    missingInCss.push({ tokenKey, cssName, tokenVal });
    continue;
  }

  // 标准化比较（去除空格差异）
  const normToken = tokenVal.replace(/\s+/g, '').toLowerCase();
  const normCss = cssVal.replace(/\s+/g, '').toLowerCase();
  if (normToken !== normCss) {
    mismatches.push({ tokenKey, cssName, tokenVal, cssVal });
  }
}

// 检查 CSS 中是否有 Token 未覆盖的颜色变量（排除语义化变量和暗色覆盖）
const knownSemanticPrefixes = [
  'page-bg', 'card-bg', 'card-border', 'input-bg', 'input-border', 'input-color',
  'section-alt-bg', 'hero-bg', 'grid-line', 'glow-primary', 'glow-ai', 'overlay-bg',
  'text-on-dark', 'border-on-dark', 'surface-on-dark', 'glass-bg', 'glass-border',
  'primary-subtle', 'primary-faint', 'primary-highlight', 'ai-purple-subtle',
  'ai-purple-alpha-60', 'surface-fallback', 'border-fallback', 'shadow-color',
  'window-red', 'window-yellow', 'window-green', 'status-online', 'status-away',
  'status-busy', 'cyan-400', 'success-alpha', 'grad-', 'ease-', 'radius-',
];

for (const [cssName, cssVal] of cssVarMap) {
  // 跳过语义化变量、渐变、阴影等
  if (knownSemanticPrefixes.some((p) => cssName.startsWith(p))) continue;
  if (cssVal.startsWith('linear-gradient')) continue;

  // 反向查找对应的 token
  let found = false;
  for (const [tokenKey] of tokenMap) {
    if (tokenToCssName(tokenKey) === cssName) {
      found = true;
      break;
    }
  }
  if (!found) {
    missingInTokens.push({ cssName, cssVal });
  }
}

/* ── 5. 输出报告 ── */
let exitCode = 0;

console.log('🔍 Design Token 双源同步校验\n');
console.log(`   Tokens 文件: ${tokenMap.size} 个颜色 token`);
console.log(`   CSS 文件:   ${cssVarMap.size} 个颜色变量\n`);

if (mismatches.length === 0 && missingInCss.length === 0 && missingInTokens.length === 0) {
  console.log('✅ 校验通过：src/tokens/index.ts 与 src/styles/global.css 颜色定义完全一致。\n');
} else {
  exitCode = 1;
  if (mismatches.length) {
    console.log(`❌ 值不一致 (${mismatches.length} 处):`);
    mismatches.forEach((item) => {
      console.log(`   • ${item.tokenKey} → CSS --${item.cssName}`);
      console.log(`     Token: ${item.tokenVal}`);
      console.log(`     CSS:   ${item.cssVal}`);
    });
    console.log('');
  }
  if (missingInCss.length) {
    console.log(`⚠️  CSS 中缺失 (${missingInCss.length} 处):`);
    missingInCss.forEach((item) => {
      console.log(`   • ${item.tokenKey} = ${item.tokenVal} → 未找到 --${item.cssName}`);
    });
    console.log('');
  }
  if (missingInTokens.length) {
    console.log(`⚠️  Token 中缺失 (${missingInTokens.length} 处):`);
    missingInTokens.forEach((item) => {
      console.log(`   • CSS --${item.cssName} = ${item.cssVal} → 未找到对应 Token`);
    });
    console.log('');
  }
}

process.exit(exitCode);
