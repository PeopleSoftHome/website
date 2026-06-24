/**
 * searchIndex.ts — 全局搜索索引（Sprint 12 / v2.3.0）
 *
 * 结构：每条记录包含
 *   id:      唯一 ID
 *   type:    'product' | 'industry' | 'resource' | 'feature' | 'general'
 *   title:   搜索结果标题（中文，en 版本用同一索引 + i18n 处理）
 *   tags:    关键词数组（中英文混合，用于模糊命中）
 *   desc:    搜索结果描述
 *   section: 点击后滚动定位的 Section ID
 *   icon:    展示图标（Emoji）
 *   weight:  权重系数 0.5~1.0（影响排序）
 */
/* ══════════════ GENERAL — 7 条 ══════════════ */
export const SEARCH_GENERAL = [
  {
    id: 'g-about', type: 'general', weight: 0.5,
    title: '关于 TalentPro',
    tags:  ['关于', '公司', '介绍', '背景', 'about', '品牌', '历史'],
    desc:  '20 年专注 HR SaaS，IDC 连续九年第一',
    section: 'whyus', icon: 'home',
  },
  {
    id: 'g-contact', type: 'general', weight: 0.6,
    title: '联系我们 / 预约演示',
    tags:  ['联系', '预约', '演示', '电话', '咨询', 'contact', '400'],
    desc:  '400-888-8888，专属顾问 1 个工作日响应',
    section: 'cta', icon: 'phone',
  },
  {
    id: 'g-price', type: 'general', weight: 0.65,
    title: '价格与方案',
    tags:  ['价格', '定价', '收费', '报价', 'price', '费用', '采购'],
    desc:  '按需定制，联系顾问获取专属报价',
    section: 'cta', icon: 'gem',
  },
  {
    id: 'g-customers', type: 'general', weight: 0.6,
    title: '客户案例',
    tags:  ['客户', '案例', '口碑', '客户故事', 'case study', '成功案例'],
    desc:  '8000+ 企业客户，覆盖各行各业',
    section: 'testimonials', icon: 'star',
  },
  {
    id: 'g-security-cert', type: 'general', weight: 0.6,
    title: '安全认证',
    tags:  ['安全', '等保三级', 'ISO27001', 'SOC2', '认证', '合规', '数据保护'],
    desc:  '等保三级 / ISO 27001 / SOC 2 / 国密算法',
    section: 'whyus', icon: 'lock',
  },
  {
    id: 'g-sla', type: 'general', weight: 0.55,
    title: '服务保障 SLA',
    tags:  ['SLA', '服务', '保障', '7x24', '响应', '运维', 'uptime'],
    desc:  '99.9% SLA 可用性，7×24 全天候支持',
    section: 'whyus', icon: 'settings',
  },
  {
    id: 'g-global', type: 'general', weight: 0.55,
    title: '出海 / 全球化 HR',
    tags:  ['出海', '全球化', '跨境', '海外', 'global', '多语言', '国际化'],
    desc:  '支持多法人、多货币、多语言全球化人事管理',
    section: 'products', icon: 'globe',
  },
];

