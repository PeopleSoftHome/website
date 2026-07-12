/**
 * 日期格式化工具
 * @param {string|Date} d - 日期值
 * @param {Object} opts - toLocaleString 选项
 * @param {string} [opts.locale='zh-CN'] - 地区
 * @param {string} [opts.fallback='-'] - 空值回退
 * @returns {string}
 */
export function formatDate(d, opts = {}) {
  if (!d) return opts.fallback || '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString(opts.locale || 'zh-CN', opts);
}

/**
 * 仅格式化日期部分（不含时间）
 * @param {string|Date} d
 * @param {string} [locale='zh-CN']
 * @returns {string}
 */
export function formatDateOnly(d, locale = 'zh-CN') {
  return formatDate(d, {
    locale,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
