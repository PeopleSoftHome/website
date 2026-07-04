/**
 * 资源类型 Tag 样式映射
 * v3.0.0 新增：product-manual（绿色）/ troubleshooting（橙色）/ company-profile（蓝色）
 * v4.2.0：支持按 locale 返回对应语言数据
 */

export interface ResourceChapter {
  id: string;
  title: string;
  content: string;
}

export interface Resource {
  id: string;
  slug: string;
  type: string;
  typeLabel: string;
  icon: string;
  imgGrad: string;
  title: string;
  description: string;
  desc: string;
  date: string;
  cta: string;
  url?: string;
  readTime: number;
  downloads: number;
  tags: string[];
  featured: boolean;
  formRequired?: boolean;
  audience?: string;
  keyTakeaways?: string[];
  chapters?: ResourceChapter[];
}

export interface ResourceType {
  value: string;
  label: string;
}

export const RESOURCE_TYPES_ZH: ResourceType[] = [
  { value: 'report', label: '白皮书' },
  { value: 'case', label: '案例集' },
  { value: 'article', label: '干货文章' },
  { value: 'guide', label: '报告' },
  { value: 'video', label: '直播视频' },
  { value: 'product-manual', label: '产品手册' },
  { value: 'troubleshooting', label: '问题排查' },
  { value: 'company-profile', label: '公司资料' },
];

export const RESOURCE_TYPES_EN: ResourceType[] = [
  { value: 'report', label: 'Whitepaper' },
  { value: 'case', label: 'Case Studies' },
  { value: 'article', label: 'Article' },
  { value: 'guide', label: 'Report' },
  { value: 'video', label: 'Webinar' },
  { value: 'product-manual', label: 'Product Manual' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'company-profile', label: 'Company Profile' },
];

export const RESOURCE_TYPE_STYLES = {
  report:          { bg: '#FFF7ED', color: '#EA580C' },  // 橙
  case:            { bg: '#F0FDF4', color: '#16A34A' },  // 绿
  article:         { bg: '#EBF1FF', color: '#1B5FEB' },  // 蓝
  guide:           { bg: '#F0F9FF', color: '#0284C7' },  // 天蓝
  video:           { bg: '#FDF4FF', color: '#7C3AED' },  // 紫
  'product-manual':{ bg: '#F0FDF4', color: '#15803D' },  // 深绿
  troubleshooting: { bg: '#FFF7ED', color: '#C2410C' },  // 深橙
  'company-profile':{ bg: '#DBEAFE', color: '#1D4ED8' }, // 深蓝
} as const;
