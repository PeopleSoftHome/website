/**
 * Logo 墙数据（SEC-09 LogoWallSection）
 * v2.2.0：新增 brandColor（品牌特征色）和 initial（首字母）字段（OPT-03）
 * icon / bg 字段保留但不再用于渲染（兼容旧代码）
 */
export const LOGO_FILTERS = [
  { id: 'all',    label: '全部' },
  { id: '先进制造', label: '先进制造' },
  { id: '消费零售', label: '消费零售' },
  { id: '互联网',  label: '互联网' },
  { id: '新能源',  label: '新能源' },
  { id: '金融',   label: '金融' },
];

export const LOGO_ITEMS = [
  { id: 'jdb',  name: '京东方',  industry: '先进制造', initial: '京', brandColor: '#0047BB', icon: '🏭', bg: '#EFF6FF' },
  { id: 'hae',  name: '海尔集团', industry: '先进制造', initial: '海', brandColor: '#C8102E', icon: '⚙️', bg: '#EFF6FF' },
  { id: 'mid',  name: '美的集团', industry: '先进制造', initial: '美', brandColor: '#E4002B', icon: '🔧', bg: '#EFF6FF' },
  { id: 'mnu',  name: '蒙牛集团', industry: '消费零售', initial: '蒙', brandColor: '#004B87', icon: '🥛', bg: '#FFF7ED' },
  { id: 'chow', name: '周大福',  industry: '消费零售', initial: '周', brandColor: '#B8960C', icon: '💍', bg: '#FFF7ED' },
  { id: 'cp',   name: '正大集团', industry: '消费零售', initial: '正', brandColor: '#C41230', icon: '🛒', bg: '#FFF7ED' },
  { id: 'bai',  name: '百度',    industry: '互联网',   initial: '百', brandColor: '#2932E1', icon: '🔍', bg: '#F0FDF4' },
  { id: 'mt',   name: '美团',    industry: '互联网',   initial: '美', brandColor: '#FFCD00', icon: '🛵', bg: '#F0FDF4' },
  { id: 'jd',   name: '京东',    industry: '互联网',   initial: '京', brandColor: '#E1251B', icon: '📦', bg: '#F0FDF4' },
  { id: 'catl', name: '宁德时代', industry: '新能源',   initial: '宁', brandColor: '#0055A5', icon: '🔋', bg: '#F0FDF4' },
  { id: 'byd',  name: '比亚迪',  industry: '新能源',   initial: '比', brandColor: '#1464A5', icon: '🚗', bg: '#F0FDF4' },
  { id: 'cmb',  name: '招商银行', industry: '金融',     initial: '招', brandColor: '#CC0000', icon: '🏦', bg: '#FDF4FF' },
  { id: 'paic', name: '中国平安', industry: '金融',     initial: '平', brandColor: '#F5821F', icon: '🛡️', bg: '#FDF4FF' },
  { id: 'vke',  name: '万科集团', industry: '先进制造', initial: '万', brandColor: '#005BAC', icon: '🏗️', bg: '#EFF6FF' },
  { id: 'cr',   name: '华润集团', industry: '消费零售', initial: '华', brandColor: '#C41230', icon: '🏢', bg: '#FFF7ED' },
  { id: 'gce',  name: '协鑫集团', industry: '新能源',   initial: '协', brandColor: '#009944', icon: '⚡', bg: '#F0FDF4' },
  { id: 'htsc', name: '华泰证券', industry: '金融',     initial: '泰', brandColor: '#003087', icon: '📈', bg: '#FDF4FF' },
  { id: 'wy',   name: '网易',    industry: '互联网',   initial: '网', brandColor: '#CC0000', icon: '🎮', bg: '#F0FDF4' },
];
