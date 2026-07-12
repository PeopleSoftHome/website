/**
 * 日期格式化工具
 */

let globalLocale: string | undefined;

/**
 * 设置全局日期 locale，通常由 App.vue 根据 vue-i18n locale 同步。
 * 这样 utils/date 无需在每个调用点传入 locale。
 */
export function setDateLocale(locale: string | undefined) {
  globalLocale = locale;
}

function resolveLocale(locale?: string): string | undefined {
  return locale || globalLocale;
}

/**
 * 格式化为日期字符串
 * @param {string|Date} d
 * @param {string} locale - 可选 locale，默认使用全局 locale
 * @returns {string}
 */
export function formatDate(d: string | Date | null | undefined, locale?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(resolveLocale(locale));
}

/**
 * 格式化为短时间字符串
 * @param {string|Date} d
 * @param {string} locale - 可选 locale，默认使用全局 locale
 * @returns {string}
 */
export function formatTime(d: string | Date | null | undefined, locale?: string) {
  if (!d) return '';
  return new Date(d).toLocaleString(resolveLocale(locale), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化为相对时间
 * @param {string|Date} d
 * @param {string} locale - 可选 locale，默认使用全局 locale
 * @returns {string}
 */
export function formatRelativeTime(d: string | Date | null | undefined, locale?: string) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(resolveLocale(locale), { numeric: 'auto' });
  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  if (diffDay < 7) return rtf.format(-diffDay, 'day');
  return formatDate(d, locale);
}
