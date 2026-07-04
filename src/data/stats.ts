/**
 * 核心统计数字数据（SEC-04 StatsSection）
 * target: count-up 的目标数值
 * suffix: 数字后缀
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const STATS_DATA_ZH = [
  { id: 'clients',  target: 8000, suffix: '+',  label: '企业客户' },
  { id: 'users',    target: 2000, suffix: '万+', label: '活跃用户' },
  { id: 'sla',      target: 99,   suffix: '.9%', label: 'SLA 可用性' },
  { id: 'years',    target: 20,   suffix: '+',   label: '年技术积累' },
  { id: 'scenes',   target: 500,  suffix: '+',   label: 'AI 能力覆盖场景' },
  { id: 'fortune',  target: 70,   suffix: '%',   label: '五百强企业选择' },
];

const STATS_DATA_EN = [
  { id: 'clients',  target: 8000, suffix: '+',   label: 'Enterprise Clients' },
  { id: 'users',    target: 2000, suffix: 'M+',  label: 'Active Users' },
  { id: 'sla',      target: 99,   suffix: '.9%', label: 'SLA Uptime' },
  { id: 'years',    target: 20,   suffix: '+',   label: 'Years of Expertise' },
  { id: 'scenes',   target: 500,  suffix: '+',   label: 'AI-Powered Scenarios' },
  { id: 'fortune',  target: 70,   suffix: '%',   label: 'Fortune 500 Clients' },
];

/** 品牌滚动栏（SEC-03 BrandScrollSection）*/
const BRAND_LOGOS_ZH = [
  '蒙牛集团', '京东方', '周大福', '海尔集团',
  '正大集团', '百度', '招商银行', '中国平安',
  '比亚迪', '宁德时代', '美的集团', '万科集团',
];

const BRAND_LOGOS_EN = [
  'Mengniu Group', 'BOE', 'Chow Tai Fook', 'Haier Group',
  'CP Group', 'Baidu', 'CMB', 'Ping An',
  'BYD', 'CATL', 'Midea Group', 'Vanke Group',
];

export function getStatsData(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return STATS_DATA_ZH;
  return STATS_DATA_EN;
}

export function getBrandLogos(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return BRAND_LOGOS_ZH;
  return BRAND_LOGOS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const STATS_DATA = STATS_DATA_ZH;
export const BRAND_LOGOS = BRAND_LOGOS_ZH;
