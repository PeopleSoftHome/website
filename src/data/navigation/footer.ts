/**
 * 页脚链接 fallback 数据
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const FOOTER_LINKS_ZH = [
  {
    title: '产品',
    links: [
      { label: '一体化 HR SaaS', href: '/products' },
      { label: 'AI Family', href: '/products' },
      { label: '人才测评', href: '/products/assess-recruit' },
      { label: 'PaaS 平台', href: '/products/paas-lowcode' },
      { label: '数字人力分析', href: '/products/analytics' },
    ],
  },
  {
    title: '资源中心',
    links: [
      { label: '研究报告', href: '/resources' },
      { label: '干货文章', href: '/blog' },
      { label: '客户案例', href: '/cases' },
      { label: '直播视频', href: '/resources' },
      { label: '用户社区', href: '/forum' },
    ],
  },
  {
    title: '了解我们',
    links: [
      { label: '公司介绍', href: '/about' },
      { label: '新闻动态', href: '/news' },
      { label: '应用广场', href: '/marketplace' },
      { label: '博客', href: '/blog' },
      { label: '社区', href: '/forum' },
      { label: '安全保障', href: '/about' },
      { label: '联系我们', href: '/about/contact' },
      { label: '加入我们', href: '/careers' },
    ],
  },
];

const FOOTER_LINKS_EN = [
  {
    title: 'Products',
    links: [
      { label: 'Integrated HR SaaS', href: '/products' },
      { label: 'AI Family', href: '/products' },
      { label: 'Talent Assessment', href: '/products/assess-recruit' },
      { label: 'PaaS Platform', href: '/products/paas-lowcode' },
      { label: 'HR Analytics', href: '/products/analytics' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Research Reports', href: '/resources' },
      { label: 'Articles', href: '/blog' },
      { label: 'Case Studies', href: '/cases' },
      { label: 'Webinars', href: '/resources' },
      { label: 'Community', href: '/forum' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'About TalentPro', href: '/about' },
      { label: 'News', href: '/news' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Blog', href: '/blog' },
      { label: 'Community', href: '/forum' },
      { label: 'Security', href: '/about' },
      { label: 'Contact Us', href: '/about/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
];

export function getFooterNav(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return FOOTER_LINKS_ZH;
  return FOOTER_LINKS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const FOOTER_LINKS = FOOTER_LINKS_ZH;
