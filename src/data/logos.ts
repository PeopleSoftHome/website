/**
 * Logo 墙数据（SEC-09 LogoWallSection）
 * v2.2.0：新增 brandColor（品牌特征色）和 initial（首字母）字段（OPT-03）
 * icon / bg 字段保留但不再用于渲染（兼容旧代码）
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const LOGO_FILTERS_ZH = [
  { id: 'all',    label: 'logoWall.filterAll' },
  { id: 'mfg',    label: 'logoWall.industries.mfg' },
  { id: 'retail', label: 'logoWall.industries.retail' },
  { id: 'internet', label: 'logoWall.industries.internet' },
  { id: 'energy', label: 'logoWall.industries.energy' },
  { id: 'finance', label: 'logoWall.industries.finance' },
];

const LOGO_FILTERS_EN = [
  { id: 'all',    label: 'logoWall.filterAll' },
  { id: 'mfg',    label: 'logoWall.industries.mfg' },
  { id: 'retail', label: 'logoWall.industries.retail' },
  { id: 'internet', label: 'logoWall.industries.internet' },
  { id: 'energy', label: 'logoWall.industries.energy' },
  { id: 'finance', label: 'logoWall.industries.finance' },
];

const LOGO_ITEMS_ZH = [
  { id: 'jdb',  name: '京东方',  industry: 'mfg', initial: '京', brandColor: '#0047BB', icon: '🏭', bg: '#EFF6FF' },
  { id: 'hae',  name: '海尔集团', industry: 'mfg', initial: '海', brandColor: '#C8102E', icon: '⚙️', bg: '#EFF6FF' },
  { id: 'mid',  name: '美的集团', industry: 'mfg', initial: '美', brandColor: '#E4002B', icon: '🔧', bg: '#EFF6FF' },
  { id: 'mnu',  name: '蒙牛集团', industry: 'retail', initial: '蒙', brandColor: '#004B87', icon: '🥛', bg: '#FFF7ED' },
  { id: 'chow', name: '周大福',  industry: 'retail', initial: '周', brandColor: '#B8960C', icon: '💍', bg: '#FFF7ED' },
  { id: 'cp',   name: '正大集团', industry: 'retail', initial: '正', brandColor: '#C41230', icon: '🛒', bg: '#FFF7ED' },
  { id: 'bai',  name: '百度',    industry: 'internet', initial: '百', brandColor: '#2932E1', icon: '🔍', bg: '#F0FDF4' },
  { id: 'mt',   name: '美团',    industry: 'internet', initial: '美', brandColor: '#FFCD00', icon: '🛵', bg: '#F0FDF4' },
  { id: 'jd',   name: '京东',    industry: 'internet', initial: '京', brandColor: '#E1251B', icon: '📦', bg: '#F0FDF4' },
  { id: 'catl', name: '宁德时代', industry: 'energy', initial: '宁', brandColor: '#0055A5', icon: '🔋', bg: '#F0FDF4' },
  { id: 'byd',  name: '比亚迪',  industry: 'energy', initial: '比', brandColor: '#1464A5', icon: '🚗', bg: '#F0FDF4' },
  { id: 'cmb',  name: '招商银行', industry: 'finance', initial: '招', brandColor: '#CC0000', icon: '🏦', bg: '#FDF4FF' },
  { id: 'paic', name: '中国平安', industry: 'finance', initial: '平', brandColor: '#F5821F', icon: '🛡️', bg: '#FDF4FF' },
  { id: 'vke',  name: '万科集团', industry: 'mfg', initial: '万', brandColor: '#005BAC', icon: '🏗️', bg: '#EFF6FF' },
  { id: 'cr',   name: '华润集团', industry: 'retail', initial: '华', brandColor: '#C41230', icon: '🏢', bg: '#FFF7ED' },
  { id: 'gce',  name: '协鑫集团', industry: 'energy', initial: '协', brandColor: '#009944', icon: '⚡', bg: '#F0FDF4' },
  { id: 'htsc', name: '华泰证券', industry: 'finance', initial: '泰', brandColor: '#003087', icon: '📈', bg: '#FDF4FF' },
  { id: 'wy',   name: '网易',    industry: 'internet', initial: '网', brandColor: '#CC0000', icon: '🎮', bg: '#F0FDF4' },
];

const LOGO_ITEMS_EN = [
  { id: 'jdb',  name: 'BOE',          industry: 'mfg', initial: 'B', brandColor: '#0047BB', icon: '🏭', bg: '#EFF6FF' },
  { id: 'hae',  name: 'Haier Group',  industry: 'mfg', initial: 'H', brandColor: '#C8102E', icon: '⚙️', bg: '#EFF6FF' },
  { id: 'mid',  name: 'Midea Group',  industry: 'mfg', initial: 'M', brandColor: '#E4002B', icon: '🔧', bg: '#EFF6FF' },
  { id: 'mnu',  name: 'Mengniu Group', industry: 'retail', initial: 'M', brandColor: '#004B87', icon: '🥛', bg: '#FFF7ED' },
  { id: 'chow', name: 'Chow Tai Fook', industry: 'retail', initial: 'C', brandColor: '#B8960C', icon: '💍', bg: '#FFF7ED' },
  { id: 'cp',   name: 'CP Group',      industry: 'retail', initial: 'C', brandColor: '#C41230', icon: '🛒', bg: '#FFF7ED' },
  { id: 'bai',  name: 'Baidu',         industry: 'internet', initial: 'B', brandColor: '#2932E1', icon: '🔍', bg: '#F0FDF4' },
  { id: 'mt',   name: 'Meituan',       industry: 'internet', initial: 'M', brandColor: '#FFCD00', icon: '🛵', bg: '#F0FDF4' },
  { id: 'jd',   name: 'JD.com',        industry: 'internet', initial: 'J', brandColor: '#E1251B', icon: '📦', bg: '#F0FDF4' },
  { id: 'catl', name: 'CATL',          industry: 'energy', initial: 'C', brandColor: '#0055A5', icon: '🔋', bg: '#F0FDF4' },
  { id: 'byd',  name: 'BYD',           industry: 'energy', initial: 'B', brandColor: '#1464A5', icon: '🚗', bg: '#F0FDF4' },
  { id: 'cmb',  name: 'CMB',           industry: 'finance', initial: 'C', brandColor: '#CC0000', icon: '🏦', bg: '#FDF4FF' },
  { id: 'paic', name: 'Ping An',       industry: 'finance', initial: 'P', brandColor: '#F5821F', icon: '🛡️', bg: '#FDF4FF' },
  { id: 'vke',  name: 'Vanke Group',   industry: 'mfg', initial: 'V', brandColor: '#005BAC', icon: '🏗️', bg: '#EFF6FF' },
  { id: 'cr',   name: 'China Resources', industry: 'retail', initial: 'C', brandColor: '#C41230', icon: '🏢', bg: '#FFF7ED' },
  { id: 'gce',  name: 'GCL Group',     industry: 'energy', initial: 'G', brandColor: '#009944', icon: '⚡', bg: '#F0FDF4' },
  { id: 'htsc', name: 'Huatai Securities', industry: 'finance', initial: 'H', brandColor: '#003087', icon: '📈', bg: '#FDF4FF' },
  { id: 'wy',   name: 'NetEase',       industry: 'internet', initial: 'N', brandColor: '#CC0000', icon: '🎮', bg: '#F0FDF4' },
];

export function getLogoFilters(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return LOGO_FILTERS_ZH;
  return LOGO_FILTERS_EN;
}

export function getLogoItems(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return LOGO_ITEMS_ZH;
  return LOGO_ITEMS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const LOGO_FILTERS = LOGO_FILTERS_ZH;
export const LOGO_ITEMS = LOGO_ITEMS_ZH;
