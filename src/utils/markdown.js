// Markdown 渲染工具 — marked + DOMPurify
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * HTML 实体编码，防止 XSS 注入（fallback 用于无 DOM 环境）
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
 * Markdown → HTML 渲染（marked + DOMPurify 净化）
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
  if (!md) return '';
  // SSR-safe: DOMPurify requires DOM; fallback to escapeHtml on server
  if (typeof window === 'undefined') {
    const safe = escapeHtml(md);
    return safe
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
  const rawHtml = marked.parse(md, { async: false, breaks: true });
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li',
      'code', 'pre', 'blockquote', 'hr', 'img', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'class'],
  });
}

/**
 * @mention 高亮渲染（输入已转义，输出安全 HTML）
 * @param {string} text
 * @returns {string}
 */
export function renderMentions(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g, '<span class="mention-highlight">@$1</span>');
}
