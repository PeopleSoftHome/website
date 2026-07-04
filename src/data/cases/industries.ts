export const CASE_INDUSTRIES = [
  '', '制造业', '零售连锁', '互联网', '金融', '能源', '快消品', '医药', '电子制造'
];

export const CASE_INDUSTRIES_EN = [
  '', 'Manufacturing', 'Retail & Chain', 'Internet', 'Finance', 'Energy', 'FMCG', 'Pharma', 'Electronics Manufacturing'
];

export function getCaseIndustries(locale?: string) {
  if (locale === 'en') return CASE_INDUSTRIES_EN;
  return CASE_INDUSTRIES;
}
