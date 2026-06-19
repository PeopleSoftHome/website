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
/* ══════════════ INDUSTRY — 5 条 ══════════════ */
export const SEARCH_INDUSTRIES = [
  {
    id: 'i-mfg', type: 'industry', weight: 0.9,
    title: '制造业方案',
    tags:  ['制造', '工厂', '蓝领', '排班', '考勤', '车间', 'manufacturing', '生产'],
    desc:  '智能排班 + 试工管理 + 资质合规追踪',
    section: 'industry', icon: 'factory',
  },
  {
    id: 'i-retail', type: 'industry', weight: 0.85,
    title: '零售连锁方案',
    tags:  ['零售', '连锁', '门店', '店长', '蓝领', 'retail', '快消', '餐饮'],
    desc:  '店长招聘工作台 + 门店人才培养 + 多门店人事管理',
    section: 'industry', icon: 'store',
  },
  {
    id: 'i-internet', type: 'industry', weight: 0.85,
    title: '互联网方案',
    tags:  ['互联网', 'HRBP', '科技', '研发', 'OKR', '互联网公司', 'tech', '敏捷'],
    desc:  'HRBP 工作台 + 全员招聘协作 + 人才梯队建设',
    section: 'industry', icon: 'monitor',
  },
  {
    id: 'i-gov', type: 'industry', weight: 0.85,
    title: '央国企方案',
    tags:  ['央企', '国企', '国有企业', '竞聘', '干部', '校招', '党建', 'SOE'],
    desc:  '数字化校招 + 年轻干部梯队 + 干部竞聘',
    section: 'industry', icon: 'landmark',
  },
  {
    id: 'i-finance', type: 'industry', weight: 0.85,
    title: '金融行业方案',
    tags:  ['金融', '银行', '保险', '证券', '校招', '后备人才', 'finance', '营销员'],
    desc:  '校招创新管理 + 后备人才库 + 营销员增员',
    section: 'industry', icon: 'bank',
  },
];

