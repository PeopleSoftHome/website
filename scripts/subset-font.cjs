#!/usr/bin/env node
/**
 * 字体子集化脚本
 * 提取项目中所有用到的字符，生成 Google Fonts &text= 参数
 */

const fs = require('fs');
const path = require('path');

const INDEX_HTML = path.join(__dirname, '..', 'index.html');
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

function collectCharsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch {
    return '';
  }
}

function collectCharsFromDir(dir, exts = ['.json', '.js']) {
  let text = '';
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      text += collectCharsFromDir(fullPath, exts);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      text += collectCharsFromFile(fullPath);
    }
  }
  return text;
}

function extractUniqueChars(text) {
  const chars = new Set();
  for (const ch of text) {
    // 保留所有非控制字符（包括中文、英文、数字、标点、空格等）
    const code = ch.codePointAt(0);
    if (code >= 32) {
      chars.add(ch);
    }
  }
  return Array.from(chars).sort();
}

function buildGoogleFontsUrl(text) {
  const encoded = encodeURIComponent(text);
  // Google Fonts &text= 参数限制约为 2000 字符的 URL 长度
  // 如果字符太多，我们截断到安全范围（约 1800 字符的编码后长度）
  if (encoded.length > 1800) {
    // 回退：只保留常用字符集 + 项目特定字符的前部分
    const basicLatin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-–—_/&()[]{}"\'@#$%*+=<>~`|^\\\n\r\t';
    const allChars = new Set([...basicLatin]);
    // 提取中文字符（CJK Unified Ideographs: U+4E00–U+9FFF）
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp >= 0x4e00 && cp <= 0x9fff) {
        allChars.add(ch);
      }
    }
    const truncated = Array.from(allChars).sort().join('');
    return `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap&text=${encodeURIComponent(truncated)}`;
  }
  return `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap&text=${encoded}`;
}

function main() {
  console.log('🔤 提取项目字符用于字体子集化...');

  let allText = '';

  // 1. 读取多语言文件
  if (fs.existsSync(LOCALES_DIR)) {
    allText += collectCharsFromDir(LOCALES_DIR, ['.json']);
    console.log('  ✅ 已读取 locales');
  }

  // 2. 读取数据文件
  if (fs.existsSync(DATA_DIR)) {
    allText += collectCharsFromDir(DATA_DIR, ['.js']);
    console.log('  ✅ 已读取 data');
  }

  // 3. 加上基础 ASCII 和常用标点（确保英文和数字正常显示）
  allText += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?-–—_/&()[]{}"\'@#$%*+=<>~`|^\\\n\r\t';

  const uniqueChars = extractUniqueChars(allText);
  console.log(`  📊 共提取 ${uniqueChars.length} 个唯一字符`);

  const fontUrl = buildGoogleFontsUrl(uniqueChars.join(''));
  console.log(`  🔗 生成的字体 URL 长度: ${fontUrl.length}`);

  // 4. 替换 index.html
  let html = fs.readFileSync(INDEX_HTML, 'utf-8');
  const original = html.match(/<link[^>]*fonts\.googleapis\.com[^>]*>/);
  if (original) {
    html = html.replace(original[0], `<link href="${fontUrl}" rel="stylesheet">`);
    fs.writeFileSync(INDEX_HTML, html);
    console.log('  ✅ index.html 已更新');
  } else {
    console.log('  ⚠️ 未找到 Google Fonts 链接');
  }

  console.log('🎉 字体子集化完成！');
}

main();
