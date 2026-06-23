/**
 * validate-token-sync.js
 * 校验 src/tokens/index.ts 中的 color tokens 是否都在 src/styles/global.css 的 :root 中有对应 CSS 变量。
 * 退出码 0 表示同步，1 表示存在缺失。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_FILE = path.join(ROOT, 'src/tokens/index.ts');
const CSS_FILE = path.join(ROOT, 'src/styles/global.css');

function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .toLowerCase();
}

function extractColorKeys(source) {
  const match = source.match(/export\s+const\s+colors\s*=\s*\{([\s\S]*?)\n\};/);
  if (!match) throw new Error('Cannot find colors object in tokens file');
  const body = match[1];
  const keys = [];
  const lineRegex = /^\s+([a-zA-Z0-9_]+):/gm;
  let m;
  while ((m = lineRegex.exec(body)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

function extractCssVars(source) {
  const rootMatch = source.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) throw new Error('Cannot find :root block in global.css');
  const body = rootMatch[1];
  const vars = new Set();
  const regex = /(--[a-z0-9-]+)\s*:/g;
  let m;
  while ((m = regex.exec(body)) !== null) {
    vars.add(m[1]);
  }
  return vars;
}

function main() {
  const tokensSource = fs.readFileSync(TOKENS_FILE, 'utf8');
  const cssSource = fs.readFileSync(CSS_FILE, 'utf8');

  const colorKeys = extractColorKeys(tokensSource);
  const cssVars = extractCssVars(cssSource);

  const missing = colorKeys
    .map((key) => ({ key, varName: `--${toKebab(key)}` }))
    .filter(({ varName }) => !cssVars.has(varName));

  if (missing.length > 0) {
    console.error('[validate-token-sync] ❌ Missing CSS variables for JS color tokens:');
    missing.forEach(({ key, varName }) => {
      console.error(`  - ${key} → ${varName}`);
    });
    process.exit(1);
  }

  console.log(`[validate-token-sync] ✅ ${colorKeys.length} color tokens are synced with CSS variables.`);
}

main();
