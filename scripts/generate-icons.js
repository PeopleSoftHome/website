/**
 * PWA 图标生成器（一次性/手动工具，非构建流程的一部分）
 *
 * 产物 public/icon-192x192.png 与 public/icon-512x512.png 已入库。
 * 仅在需要更换品牌图标时手动运行：node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="24" fill="#1B5FEB"/>
  <text x="96" y="128" font-family="Arial, sans-serif" font-size="96" font-weight="800" fill="white" text-anchor="middle">T</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#1B5FEB"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="800" fill="white" text-anchor="middle">T</text>
</svg>`;

const publicDir = join(__dirname, '../public');

await sharp(Buffer.from(svg192)).png().toFile(join(publicDir, 'icon-192x192.png'));
console.log('[icon] Generated public/icon-192x192.png');

await sharp(Buffer.from(svg512)).png().toFile(join(publicDir, 'icon-512x512.png'));
console.log('[icon] Generated public/icon-512x512.png');
