/**
 * 日期格式化工具
 */
export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  fallback?: string;
}

export function formatDate(d: string | Date | null | undefined, opts: FormatDateOptions = {}): string {
  if (!d) return opts.fallback || '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  const { locale, fallback: _fallback, ...intlOpts } = opts;
  return date.toLocaleString(locale || 'zh-CN', intlOpts);
}

/**
 * 仅格式化日期部分（不含时间）
 */
export function formatDateOnly(d: string | Date | null | undefined, locale = 'zh-CN'): string {
  return formatDate(d, {
    locale,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
