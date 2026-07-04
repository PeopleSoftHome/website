/**
 * 联系我们页面数据
 * v4.1.0-Sprint4：FAQ + 联系信息
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const CONTACT_FAQ_ZH = [
  { q: '如何预约产品演示？', a: '您可以通过页面上的「预约演示」按钮提交需求，我们的顾问团队将在 1 个工作日内与您联系，安排一对一产品演示。' },
  { q: 'TalentPro 支持哪些部署方式？', a: '我们支持公有云 SaaS、私有云部署和混合部署三种模式，满足不同规模企业的安全与合规需求。' },
  { q: '如何申请成为生态合作伙伴？', a: '请发送邮件至 partner@talentpro.com，附上公司介绍与合作意向，我们的生态团队将在 3 个工作日内回复。' },
  { q: '是否支持海外员工管理？', a: '是的，TalentPro 支持 80+ 国家的劳动法合规、多币种薪酬、多语言界面，助力中企出海。' },
  { q: '数据安全如何保障？', a: 'TalentPro 通过等保三级、ISO 27001、SOC 2 Type II 认证，采用 TLS 1.3 传输加密、AES-256-GCM 存储加密、字段级加密等多重安全机制。' },
];

const CONTACT_FAQ_EN = [
  { q: 'How do I book a product demo?', a: 'Click the "Book a Demo" button on the page to submit your request. Our consulting team will contact you within 1 business day to arrange a one-on-one product demo.' },
  { q: 'What deployment options does TalentPro support?', a: 'We support public cloud SaaS, private cloud, and hybrid deployment models to meet the security and compliance needs of enterprises of all sizes.' },
  { q: 'How do I apply to become an ecosystem partner?', a: 'Please email partner@talentpro.com with your company introduction and partnership intent. Our ecosystem team will respond within 3 business days.' },
  { q: 'Does TalentPro support overseas employee management?', a: 'Yes. TalentPro supports labor law compliance in 80+ countries, multi-currency payroll, and multi-language interfaces to help Chinese companies expand globally.' },
  { q: 'How is data security ensured?', a: 'TalentPro holds Class-3 cybersecurity, ISO 27001, and SOC 2 Type II certifications. We use TLS 1.3 for transmission, AES-256-GCM for storage, and field-level encryption, among other security measures.' },
];

const CERTIFICATIONS_ZH = [
  { name: '等保三级', icon: '🛡️' },
  { name: 'ISO 27001', icon: '🔒' },
  { name: 'SOC 2 Type II', icon: '📋' },
  { name: 'GDPR 合规', icon: '🇪🇺' },
  { name: '国家高新', icon: '🔬' },
  { name: 'CMMI 5', icon: '📊' },
];

const CERTIFICATIONS_EN = [
  { name: 'Class-3 Cybersecurity', icon: '🛡️' },
  { name: 'ISO 27001', icon: '🔒' },
  { name: 'SOC 2 Type II', icon: '📋' },
  { name: 'GDPR Compliant', icon: '🇪🇺' },
  { name: 'National High-Tech Enterprise', icon: '🔬' },
  { name: 'CMMI Level 5', icon: '📊' },
];

const PARTNER_LOGOS_ZH = [
  '红杉资本', '高瓴资本', '软银愿景', '腾讯', '阿里巴巴', '华为',
  '字节跳动', '京东', '美团', '小米', '百度', '网易',
];

const PARTNER_LOGOS_EN = [
  'Sequoia Capital', 'Hillhouse Capital', 'SoftBank Vision', 'Tencent', 'Alibaba', 'Huawei',
  'ByteDance', 'JD.com', 'Meituan', 'Xiaomi', 'Baidu', 'NetEase',
];

export function getContactFaq(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return CONTACT_FAQ_ZH;
  return CONTACT_FAQ_EN;
}

export function getCertifications(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return CERTIFICATIONS_ZH;
  return CERTIFICATIONS_EN;
}

export function getPartnerLogos(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return PARTNER_LOGOS_ZH;
  return PARTNER_LOGOS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const CONTACT_FAQ = CONTACT_FAQ_ZH;
export const CERTIFICATIONS = CERTIFICATIONS_ZH;
export const PARTNER_LOGOS = PARTNER_LOGOS_ZH;
