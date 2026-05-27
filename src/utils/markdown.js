// Markdown 渲染工具（预留 marked + DOMPurify 接口）
// 当前实现：基于 XSS-safe 的轻量正则渲染
// 待安装依赖后迁移：npm install marked dompurify

/**
 * HTML 实体编码，防止 XSS 注入
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 轻量 Markdown → HTML 渲染
 * 输入先经过 escapeHtml，再应用安全的 markdown 标签
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  if (!md) return '';
  const safe = escapeHtml(md);
  return safe
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/**
 * 预留接口：marked + DOMPurify 完整渲染
 * 安装依赖后替换 renderMarkdown 实现：
 *
 * import { marked } from 'marked';
 * import DOMPurify from 'dompurify';
 *
 * export function renderMarkdown(md) {
 *   if (!md) return '';
 *   const rawHtml = marked.parse(md, { async: false });
 *   return DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS: ['p','br','h1','h2','h3','strong','em','a','ul','ol','li','code','pre','blockquote'] });
 * }
 */
