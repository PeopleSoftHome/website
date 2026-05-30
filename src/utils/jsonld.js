/**
 * JSON-LD 结构化数据注入工具
 * 用于 SPA 路由切换时动态注入/移除 schema.org 标记
 */

const SCRIPT_ID = 'dynamic-jsonld';

export function injectJsonLd(schema) {
  if (typeof document === 'undefined') return;
  // 开发环境也注入，便于调试

  let el = document.getElementById(SCRIPT_ID);
  if (!el) {
    el = document.createElement('script');
    el.id = SCRIPT_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

export function removeJsonLd() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(SCRIPT_ID);
  if (el) el.remove();
}
