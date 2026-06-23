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
/* ══════════════ SECONDARY PAGES — 直达 ══════════════ */
export const SEARCH_PAGES = [
  {
    id: 'page-products', type: 'page', weight: 0.9,
    title: '产品矩阵',
    tags: ['产品','功能','模块','招聘','绩效','薪酬','product'],
    desc: '20+ 产品覆盖 HR SaaS、AI Family、测评、PaaS',
    section: 'products', icon: 'grid',
    route: '/products',
  },
  {
    id: 'page-solutions', type: 'page', weight: 0.9,
    title: '行业解决方案',
    tags: ['方案','行业','制造','零售','互联网','央国企','solution'],
    desc: '5 大行业深度解决方案，开箱即用',
    section: 'industry', icon: 'briefcase',
    route: '/solutions',
  },
  {
    id: 'page-cases', type: 'page', weight: 0.85,
    title: '客户案例',
    tags: ['案例','客户','成功故事','口碑','case study'],
    desc: '8000+ 企业客户的数字化转型实践',
    section: 'testimonials', icon: 'star',
    route: '/cases',
  },
  {
    id: 'page-resources', type: 'page', weight: 0.85,
    title: '资源中心',
    tags: ['资源','白皮书','报告','下载','干货','视频'],
    desc: '白皮书、案例集、视频、操作指南等 16 种资源',
    section: 'resources', icon: 'book-open',
    route: '/resources',
  },
  {
    id: 'page-news', type: 'page', weight: 0.75,
    title: '新闻中心',
    tags: ['新闻','动态','公司','媒体','报道'],
    desc: 'TalentPro 最新产品动态与行业资讯',
    section: 'general', icon: 'newspaper',
    route: '/news',
  },
  {
    id: 'page-careers', type: 'page', weight: 0.7,
    title: '加入我们',
    tags: ['招聘','职位','校招','社招','Careers','工作'],
    desc: '与 TalentPro 一起成长，开放 100+ 职位',
    section: 'general', icon: 'users',
    route: '/careers',
  },
  {
    id: 'page-about', type: 'page', weight: 0.7,
    title: '了解我们',
    tags: ['关于','公司','团队','介绍','品牌'],
    desc: '20 年专注 HR SaaS，IDC 连续九年第一',
    section: 'whyus', icon: 'home',
    route: '/about',
  },
  {
    id: 'page-blog', type: 'page', weight: 0.75,
    title: '博客',
    tags: ['博客','文章','HR','趋势','洞察','blog'],
    desc: 'HR 数字化最佳实践与行业洞察',
    section: 'general', icon: 'file-text',
    route: '/blog',
  },
  {
    id: 'page-forum', type: 'page', weight: 0.7,
    title: '社区论坛',
    tags: ['论坛','社区','讨论','问答','交流','forum'],
    desc: 'HR 从业者交流社区，分享经验与答疑',
    section: 'general', icon: 'message-circle',
    route: '/forum',
  },
];

