/**
 * 页脚热门标签 fallback 数据
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const HOT_TAGS_ZH = ['AI 招聘', '人才盘点', '校园招聘', '绩效管理', '央国企', '中企出海'];

const HOT_TAGS_EN = ['AI Recruiting', 'Talent Review', 'Campus Hiring', 'Performance', 'SOE', 'Global Expansion'];

export function getHotTags(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return HOT_TAGS_ZH;
  return HOT_TAGS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const HOT_TAGS = HOT_TAGS_ZH;
