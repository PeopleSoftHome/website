/**
 * 字体子集化脚本
 * 提取项目中所有用到的字符，裁剪 Noto Sans SC woff2 字体文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import subsetFont from 'subset-font';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');

function collectTextFromFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function collectTextFromDir(dir, exts) {
  let text = '';
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      text += collectTextFromDir(fullPath, exts);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      text += collectTextFromFile(fullPath);
    }
  }
  return text;
}

function extractUniqueChars(text) {
  const chars = new Set();
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 32) chars.add(ch);
  }
  return Array.from(chars).join('');
}

async function subsetWoff2(inputPath, chars) {
  const original = fs.readFileSync(inputPath);
  const subset = await subsetFont(original, chars, {
    targetFormat: 'woff2',
  });
  fs.writeFileSync(inputPath, subset);
  return { original: original.length, subset: subset.length };
}

async function main() {
  console.log('🔤 提取项目字符用于字体子集化...');

  let allText = '';
  if (fs.existsSync(LOCALES_DIR)) {
    allText += collectTextFromDir(LOCALES_DIR, ['.json']);
    console.log('  ✅ 已读取 locales');
  }
  if (fs.existsSync(DATA_DIR)) {
    allText += collectTextFromDir(DATA_DIR, ['.js']);
    console.log('  ✅ 已读取 data');
  }
  allText += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-–—_/&()[]{}"\'@#$%*+=<>~`|^\\\n\r\t';

  const uniqueChars = extractUniqueChars(allText);
  console.log(`  📊 共提取 ${uniqueChars.length} 个唯一字符`);

  const files = fs.readdirSync(FONTS_DIR).filter((f) => f.endsWith('.woff2'));
  let totalOriginal = 0;
  let totalSubset = 0;

  for (const file of files) {
    const inputPath = path.join(FONTS_DIR, file);
    const result = await subsetWoff2(inputPath, uniqueChars);
    totalOriginal += result.original;
    totalSubset += result.subset;
    console.log(`  ✂️ ${file}: ${(result.original / 1024).toFixed(1)}KB → ${(result.subset / 1024).toFixed(1)}KB`);
  }

  const saved = ((1 - totalSubset / totalOriginal) * 100).toFixed(1);
  console.log(`\n🎉 字体子集化完成！总计: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalSubset / 1024).toFixed(1)}KB (节省 ${saved}%)`);
}

main().catch((e) => {
  console.error('❌ 字体子集化失败:', e.message);
  process.exit(1);
});
