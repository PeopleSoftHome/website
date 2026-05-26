/**
 * 导航菜单数据
 * 修改导航内容只需编辑此文件，无需触碰组件
 */

export const NAV_LINKS = [
  {
    id: 'ai-family',
    label: 'AI Family',
    hasDropdown: true,
    items: [
      { icon: 'bot', title: 'AI 招聘助手',   desc: '让招聘更智能、更高效',   href: '#' },
      { icon: 'target', title: 'AI 面试官',     desc: '不止评能力，更要测潜力', href: '#' },
      { icon: 'book', title: 'AI 学习助手',   desc: '陪伴员工个性化成长',     href: '#' },
      { icon: 'award', title: 'AI 领导力教练', desc: '管理者专属成长伙伴',     href: '#' },
    ],
    banner: {
      thumb: 'award',
      title: '2026 AI+HR 最佳实践案例集',
      desc:  '蒙牛、京东方等先锋企业的 AI 落地经验',
      href:  '#',
    },
  },
  {
    id: 'products',
    label: '产品',
    hasDropdown: true,
    items: [
      { icon: 'users', title: '招聘管理系统', desc: '全流程数字化招聘',   href: '#' },
      { icon: 'bar-chart', title: '绩效管理系统', desc: '目标对齐、绩效驱动', href: '#' },
      { icon: 'building', title: '组织人事系统', desc: '集团化组织管控',     href: '#' },
      { icon: 'dollar-sign', title: '薪酬管理系统', desc: '精准薪酬，自动核算', href: '#' },
    ],
    banner: {
      thumb: 'bar-chart',
      title: '《2026 HR 数智化成熟度模型白皮书》',
      desc:  '权威调研，免费下载',
      href:  '#',
    },
  },
  {
    id: 'solutions',
    label: '解决方案',
    hasDropdown: true,
    items: [
      { icon: 'factory', title: '制造业方案', desc: '精细化管理，加速转型',   href: '#' },
      { icon: 'store', title: '零售连锁方案', desc: '精益门店运营，协同提效', href: '#' },
      { icon: 'monitor', title: '互联网方案', desc: '智慧决策，极致体验',     href: '#' },
      { icon: 'landmark', title: '央国企方案', desc: '推进人才强企战略',       href: '#' },
    ],
    banner: {
      thumb: 'factory',
      title: '制造业 HR 数字化转型实战指南',
      desc:  '覆盖排班 / 考勤 / 蓝领招聘全场景',
      href:  '#',
    },
  },
  {
    id: 'cases',
    label: '客户案例',
    hasDropdown: false,
    href: '#',
  },
  {
    id: 'resources',
    label: '资源中心',
    hasDropdown: false,
    href: '#',
  },
];

export const FOOTER_LINKS = [
  {
    title: '产品',
    links: [
      { label: '一体化 HR SaaS', href: '#' },
      { label: 'AI Family',      href: '#' },
      { label: '人才测评',        href: '#' },
      { label: 'PaaS 平台',      href: '#' },
      { label: '数字人力分析',    href: '#' },
    ],
  },
  {
    title: '资源中心',
    links: [
      { label: '研究报告', href: '#' },
      { label: '干货文章', href: '#' },
      { label: '客户案例', href: '#' },
      { label: '直播视频', href: '#' },
      { label: '用户社区', href: '#' },
    ],
  },
  {
    title: '了解我们',
    links: [
      { label: '公司介绍', href: '#' },
      { label: '新闻动态', href: '#' },
      { label: '安全保障', href: '#' },
      { label: '联系我们', href: '#' },
      { label: '加入我们', href: '#' },
    ],
  },
];

export const HOT_TAGS = ['AI 招聘', '人才盘点', '校园招聘', '绩效管理', '央国企', '中企出海'];
