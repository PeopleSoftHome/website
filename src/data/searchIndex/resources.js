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
/* ══════════════ RESOURCE — 6 条 ══════════════ */
export const SEARCH_RESOURCES = [
  {
    id: 'r-whitepaper', type: 'resource', weight: 0.85,
    title: 'HR 数智化成熟度白皮书',
    tags:  ['白皮书', '报告', 'HRDIMM', '数智化', '成熟度', 'whitepaper', '趋势'],
    desc:  '整合 567 家企业调研，三阶转型方案',
    section: 'resources', icon: 'bar-chart',
  },
  {
    id: 'r-ai-cases', type: 'resource', weight: 0.85,
    title: 'AI 面试官案例集',
    tags:  ['案例', 'AI面试', '案例集', '海尔', '茶颜悦色', '校招案例'],
    desc:  '11 家领军企业 AI 面试实战亲测',
    section: 'resources', icon: 'award',
  },
  {
    id: 'r-talent-review', type: 'resource', weight: 0.8,
    title: 'AI 重塑人才盘点体系',
    tags:  ['盘点', '九宫格', 'AI', '人才管理', '文章', '干货'],
    desc:  '从传统九宫格到 AI 驱动的数字化盘点',
    section: 'resources', icon: 'target',
  },
  {
    id: 'r-campus', type: 'resource', weight: 0.8,
    title: '校园招聘 AI 应用指南',
    tags:  ['校招', '校园招聘', 'AI', '指南', '白皮书', '大学生', '应届生'],
    desc:  '全链路校招提效方案，50+ 企业案例',
    section: 'resources', icon: 'award',
  },
  {
    id: 'r-digital', type: 'resource', weight: 0.75,
    title: 'HR 数字化升级全景指南',
    tags:  ['数字化', '转型', '报告', '路线图', 'HR数字化', '实施'],
    desc:  '8 大业务模块、12 个决策节点完整路径',
    section: 'resources', icon: 'clipboard-list',
  },
  {
    id: 'r-video', type: 'resource', weight: 0.75,
    title: '人才选用育留一体化直播',
    tags:  ['直播', '视频', '人才管理', '选用育留', '回放', '方法论'],
    desc:  '首席专家主讲，完整方法论 PPT 下载',
    section: 'resources', icon: 'play-circle',
  },
];

