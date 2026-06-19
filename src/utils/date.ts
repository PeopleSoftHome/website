/**
 * 日期格式化工具
 */

/**
 * 格式化为日期字符串（YYYY年M月D日）
 * @param {string|Date} d
 * @returns {string}
 */
export function formatDate(d: string | Date | null | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN');
}

/**
 * 格式化为短时间字符串（M月D日 HH:mm）
 * @param {string|Date} d
 * @returns {string}
 */
export function formatTime(d: string | Date | null | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化为相对时间（刚刚、N分钟前、N小时前、昨天、N天前）
 * @param {string|Date} d
 * @returns {string}
 */
export function formatRelativeTime(d: string | Date | null | undefined) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  return formatDate(d);
}
