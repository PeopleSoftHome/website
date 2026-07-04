/**
 * 安全认证数据（SEC-10 WhyUsSection 底部徽章区）
 * v2.2.0 新增（ENH-02）
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const SECURITY_CERTS_ZH = [
  {
    id: 'djb3',
    icon: 'lock',
    label: '等保三级',
    desc: '国家信息安全最高认证',
  },
  {
    id: 'iso27001',
    icon: 'award',
    label: 'ISO 27001',
    desc: '国际信息安全管理标准',
  },
  {
    id: 'soc2',
    icon: 'check-circle',
    label: 'SOC 2',
    desc: 'Type II 审计通过',
  },
  {
    id: 'bank',
    icon: 'lock',
    label: '银行级加密',
    desc: 'AES-256 数据全程加密',
  },
  {
    id: 'sm',
    icon: 'shield',
    label: '国密算法',
    desc: 'SM2/SM3/SM4 合规',
  },
  {
    id: 'nine',
    icon: 'shield-check',
    label: '九层防护',
    desc: '多维安全防御体系',
  },
];

const SECURITY_CERTS_EN = [
  {
    id: 'djb3',
    icon: 'lock',
    label: 'Level-3 Security',
    desc: "China's highest information security standard",
  },
  {
    id: 'iso27001',
    icon: 'award',
    label: 'ISO 27001',
    desc: 'International information security management standard',
  },
  {
    id: 'soc2',
    icon: 'check-circle',
    label: 'SOC 2',
    desc: 'Type II audit passed',
  },
  {
    id: 'bank',
    icon: 'lock',
    label: 'Bank-Grade Encryption',
    desc: 'AES-256 end-to-end data encryption',
  },
  {
    id: 'sm',
    icon: 'shield',
    label: 'Domestic Cryptography',
    desc: 'SM2/SM3/SM4 algorithm compliance',
  },
  {
    id: 'nine',
    icon: 'shield-check',
    label: '9-Layer Defense',
    desc: 'Multi-dimensional security protection system',
  },
];

export function getSecurityCerts(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return SECURITY_CERTS_ZH;
  return SECURITY_CERTS_EN;
}

/** 兼容旧直接引用：默认中文 */
export const SECURITY_CERTS = SECURITY_CERTS_ZH;
