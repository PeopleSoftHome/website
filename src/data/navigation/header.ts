/**
 * P0 Navigation v2 — small, product-first primary navigation.
 * Secondary utilities (search, language, theme, account, commerce) should
 * remain discoverable from the product shell / command palette rather than
 * competing with the primary story above the fold.
 */

const NAV_LINKS_ZH = [
  {
    id: 'platform',
    label: '平台',
    hasDropdown: true,
    items: [
      { icon: 'grid', title: 'TalentPro Platform', desc: '统一的人才、组织与工作空间', href: '/platform' },
      { icon: 'users', title: 'Workspace', desc: '企业团队协作与人才运营', href: '/workspace' },
      { icon: 'bar-chart', title: 'Analytics', desc: '从数据到决策的 HR Intelligence', href: '/analytics' },
    ],
  },
  {
    id: 'solutions',
    label: '解决方案',
    hasDropdown: true,
    items: [
      { icon: 'factory', title: '制造业', desc: '复杂 workforce 的精细化运营', href: '/solutions/manufacturing' },
      { icon: 'store', title: '零售连锁', desc: '多门店人才效率与协同', href: '/solutions/retail' },
      { icon: 'monitor', title: '互联网与科技', desc: '快速增长团队的人才决策', href: '/solutions/internet' },
      { icon: 'landmark', title: '央国企', desc: '人才强企与集团化治理', href: '/solutions/government' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    hasDropdown: true,
    items: [
      { icon: 'bot', title: 'AI Workforce Copilot', desc: '理解业务问题，定位瓶颈并给出行动', href: '/ai' },
      { icon: 'target', title: 'AI 招聘', desc: '从候选人搜索到决策辅助', href: '/products/ai-recruit' },
      { icon: 'award', title: 'AI 领导力', desc: '让管理者获得持续决策支持', href: '/products/ai-coach' },
    ],
  },
  {
    id: 'resources',
    label: '资源',
    hasDropdown: true,
    items: [
      { icon: 'book-open', title: '案例', desc: '看结果，不只看功能', href: '/cases' },
      { icon: 'book', title: '洞察', desc: 'HR 数字化与 AI 趋势', href: '/resources' },
      { icon: 'message-circle', title: '社区', desc: '实践交流与最佳实践', href: '/forum' },
    ],
  },
];

const NAV_LINKS_EN = [
  {
    id: 'platform',
    label: 'Platform',
    hasDropdown: true,
    items: [
      { icon: 'grid', title: 'TalentPro Platform', desc: 'One system for people, work and decisions', href: '/platform' },
      { icon: 'users', title: 'Workspace', desc: 'Collaborate and operate talent at scale', href: '/workspace' },
      { icon: 'bar-chart', title: 'Analytics', desc: 'Turn workforce data into decisions', href: '/analytics' },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    hasDropdown: true,
    items: [
      { icon: 'factory', title: 'Manufacturing', desc: 'Operate complex workforces with precision', href: '/solutions/manufacturing' },
      { icon: 'store', title: 'Retail & Chain', desc: 'Improve multi-site workforce efficiency', href: '/solutions/retail' },
      { icon: 'monitor', title: 'Internet & Tech', desc: 'Make better talent decisions at speed', href: '/solutions/internet' },
      { icon: 'landmark', title: 'State-owned Enterprise', desc: 'Build talent-led enterprise strategy', href: '/solutions/government' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    hasDropdown: true,
    items: [
      { icon: 'bot', title: 'AI Workforce Copilot', desc: 'Understand problems, find bottlenecks, take action', href: '/ai' },
      { icon: 'target', title: 'AI Recruiting', desc: 'From candidate discovery to decision support', href: '/products/ai-recruit' },
      { icon: 'award', title: 'AI Leadership', desc: 'Continuous decision support for managers', href: '/products/ai-coach' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    hasDropdown: true,
    items: [
      { icon: 'book-open', title: 'Case Studies', desc: 'See outcomes, not just features', href: '/cases' },
      { icon: 'book', title: 'Insights', desc: 'HR digitalization and AI trends', href: '/resources' },
      { icon: 'message-circle', title: 'Community', desc: 'Practice and best-practice exchange', href: '/forum' },
    ],
  },
];

export function getHeaderNav(locale?: string) {
  return locale === 'zh' || locale === 'zh-TW' ? NAV_LINKS_ZH : NAV_LINKS_EN;
}

export const NAV_LINKS = NAV_LINKS_ZH;
