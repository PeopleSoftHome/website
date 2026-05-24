/**
 * 核心统计数字数据（SEC-04 StatsSection）
 * target: count-up 的目标数值
 * suffix: 数字后缀
 */
export const STATS_DATA = [
  { id: 'clients',  target: 8000, suffix: '+',  label: '企业客户' },
  { id: 'users',    target: 2000, suffix: '万+', label: '活跃用户' },
  { id: 'sla',      target: 99,   suffix: '.9%', label: 'SLA 可用性' },
  { id: 'years',    target: 20,   suffix: '+',   label: '年技术积累' },
  { id: 'scenes',   target: 500,  suffix: '+',   label: 'AI 能力覆盖场景' },
  { id: 'fortune',  target: 70,   suffix: '%',   label: '五百强企业选择' },
];

/** 品牌滚动栏（SEC-03 BrandScrollSection）*/
export const BRAND_LOGOS = [
  '蒙牛集团', '京东方', '周大福', '海尔集团',
  '正大集团', '百度', '招商银行', '中国平安',
  '比亚迪', '宁德时代', '美的集团', '万科集团',
];
