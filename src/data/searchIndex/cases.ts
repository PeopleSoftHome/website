/**
 * searchIndex.js — 全局搜索索引（Sprint 12 / v2.3.0）
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
/* ══════════════ CASE STUDIES — 8 条 ══════════════ */
export const SEARCH_CASES = [
  {
    id: 'cs-mengniu', type: 'case', weight: 0.85,
    title: '蒙牛乳业：AI 招聘助手助力万人校招',
    tags: ['蒙牛','校招','AI招聘','快消品','简历筛选','case'],
    desc: '简历筛选效率提升 80%，校招周期缩短至 36 天',
    section: 'cases', icon: 'award',
    route: '/cases/mengniu-ai-recruit',
  },
  {
    id: 'cs-haier', type: 'case', weight: 0.85,
    title: '海尔集团：智能排班与考勤数字化',
    tags: ['海尔','制造业','智能排班','考勤','薪酬核算','case'],
    desc: '万人工厂人效提升 20%，算薪时间从 10 天缩短至 1 天',
    section: 'cases', icon: 'factory',
    route: '/cases/haier-manufacturing',
  },
  {
    id: 'cs-suning', type: 'case', weight: 0.8,
    title: '苏宁易购：2000+ 门店人事统一管控',
    tags: ['苏宁','零售','门店','人才培养','组织人事','case'],
    desc: '店长培养周期缩短 40%，新店人员到位率 100%',
    section: 'cases', icon: 'store',
    route: '/cases/suning-retail',
  },
  {
    id: 'cs-picc', type: 'case', weight: 0.8,
    title: '中国人保：金融行业人才数字化',
    tags: ['人保','金融','保险','校招','后备人才','case'],
    desc: '校招效率提升 60%，后备人才库覆盖核心岗位',
    section: 'cases', icon: 'bank',
    route: '/cases/picc-finance',
  },
  {
    id: 'cs-stategrid', type: 'case', weight: 0.8,
    title: '国家电网：央国企人才强企',
    tags: ['电网','央国企','干部','竞聘','梯队','case'],
    desc: '干部竞聘全流程线上化，年轻干部梯队建设',
    section: 'cases', icon: 'landmark',
    route: '/cases/stategrid-gov',
  },
  {
    id: 'cs-bytedance', type: 'case', weight: 0.8,
    title: '字节跳动：互联网敏捷人才管理',
    tags: ['字节','互联网','OKR','HRBP','敏捷','case'],
    desc: '全员 OKR 对齐，HRBP 数据驱动决策',
    section: 'cases', icon: 'monitor',
    route: '/cases/bytedance-internet',
  },
  {
    id: 'cs-sindobiopharma', type: 'case', weight: 0.75,
    title: '信达生物：医药研发人才全周期管理',
    tags: ['信达','医药','研发','人才盘点','合规','case'],
    desc: '研发人才全生命周期数字化管理，合规追溯',
    section: 'cases', icon: 'heart',
    route: '/cases/sindobiopharma-pharma',
  },
  {
    id: 'cs-boe', type: 'case', weight: 0.75,
    title: '京东方：制造业人才发展与继任',
    tags: ['京东方','制造','继任','高潜','人才梯队','case'],
    desc: '关键岗位继任者识别，系统化培养路径',
    section: 'cases', icon: 'factory',
    route: '/cases/boe-manufacturing',
  },
];

