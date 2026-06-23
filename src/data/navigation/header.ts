export const NAV_LINKS = [
  {
    id: 'ai-family',
    label: 'AI Family',
    hasDropdown: true,
    items: [
      { icon: 'bot', title: 'AI 招聘助手', desc: '让招聘更智能、更高效', href: '/products/ai-recruit' },
      { icon: 'target', title: 'AI 面试官', desc: '不止评能力，更要测潜力', href: '/products/ai-interview' },
      { icon: 'book', title: 'AI 学习助手', desc: '陪伴员工个性化成长', href: '/products/ai-course' },
      { icon: 'award', title: 'AI 领导力教练', desc: '管理者专属成长伙伴', href: '/products/ai-coach' },
    ],
    banner: {
      thumb: 'award',
      title: '2026 AI+HR 最佳实践案例集',
      desc: '蒙牛、京东方等先锋企业的 AI 落地经验',
      href: '/cases',
    },
  },
  {
    id: 'products',
    label: '产品',
    hasDropdown: true,
    items: [
      { icon: 'users', title: '招聘管理系统', desc: '全流程数字化招聘', href: '/products/recruit' },
      { icon: 'bar-chart', title: '绩效管理系统', desc: '目标对齐、绩效驱动', href: '/products/performance' },
      { icon: 'building', title: '组织人事系统', desc: '集团化组织管控', href: '/products/org' },
      { icon: 'dollar-sign', title: '薪酬管理系统', desc: '精准薪酬，自动核算', href: '/products/payroll' },
    ],
    banner: {
      thumb: 'bar-chart',
      title: '《2026 HR 数智化成熟度模型白皮书》',
      desc: '权威调研，免费下载',
      href: '/resources/hr-digitization-whitepaper',
    },
  },
  {
    id: 'solutions',
    label: '解决方案',
    hasDropdown: true,
    items: [
      { icon: 'factory', title: '制造业方案', desc: '精细化管理，加速转型', href: '/solutions/manufacturing' },
      { icon: 'store', title: '零售连锁方案', desc: '精益门店运营，协同提效', href: '/solutions/retail' },
      { icon: 'monitor', title: '互联网方案', desc: '智慧决策，极致体验', href: '/solutions/internet' },
      { icon: 'landmark', title: '央国企方案', desc: '推进人才强企战略', href: '/solutions/government' },
    ],
    banner: {
      thumb: 'factory',
      title: '制造业 HR 数字化转型实战指南',
      desc: '覆盖排班 / 考勤 / 蓝领招聘全场景',
      href: '/resources/hr-digital-upgrade',
    },
  },
  {
    id: 'cases',
    label: '客户案例',
    hasDropdown: false,
    href: '/cases',
  },
  {
    id: 'resources',
    label: '资源中心',
    hasDropdown: false,
    href: '/resources',
  },
  {
    id: 'about',
    label: '关于我们',
    hasDropdown: true,
    items: [
      { icon: 'building', title: '公司介绍', desc: '了解 TalentPro 的发展历程与愿景', href: '/about' },
      { icon: 'newspaper', title: '新闻动态', desc: '最新产品发布与企业资讯', href: '/news' },
      { icon: 'grid', title: '应用广场', desc: '探索丰富的 HR 生态应用', href: '/marketplace' },
      { icon: 'book-open', title: '博客', desc: 'HR 数字化实践与行业洞察', href: '/blog' },
      { icon: 'message-circle', title: '社区', desc: '用户交流与最佳实践分享', href: '/forum' },
      { icon: 'users', title: '加入我们', desc: '与我们一起打造下一代 HR SaaS', href: '/careers' },
      { icon: 'mail', title: '联系我们', desc: '获取产品咨询与专业支持', href: '/about/contact' },
    ],
  },
];
