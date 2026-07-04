/**
 * 招聘页面 fallback 数据
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const CAREER_TESTIMONIALS_ZH = [
  { name: '李明', role: '高级产品经理', avatar: 'L', quote: '从校园招聘到晋升产品负责人，TalentPro给了我成长的土壤。', joinYear: 2020 },
  { name: 'Sarah Chen', role: '全栈工程师', avatar: 'S', quote: '技术栈前沿、团队氛围开放，这里每个人都能自由探索。', joinYear: 2019 },
  { name: '王涛', role: '客户成功经理', avatar: 'W', quote: '从一线销售到客户成功负责人，公司提供清晰的晋升通道。', joinYear: 2021 },
];

const CAREER_TESTIMONIALS_EN = [
  { name: 'Li Ming', role: 'Senior Product Manager', avatar: 'L', quote: 'From campus hire to product lead, TalentPro gave me the soil to grow.', joinYear: 2020 },
  { name: 'Sarah Chen', role: 'Full-Stack Engineer', avatar: 'S', quote: 'Cutting-edge tech stack and an open team culture — everyone here is free to explore.', joinYear: 2019 },
  { name: 'Wang Tao', role: 'Customer Success Manager', avatar: 'W', quote: 'From frontline sales to customer success lead, the company provides a clear growth path.', joinYear: 2021 },
];

const CAREER_PATH_ZH = [
  { stage: '融入', icon: '🏠', desc: '新人入职培训 + 导师一对一辅导' },
  { stage: '成长', icon: '📈', desc: '季度 OKR + 技能进阶课程' },
  { stage: '突破', icon: '🚀', desc: '跨部门轮岗 + 项目负责人机会' },
  { stage: '引领', icon: '⭐', desc: '晋升管理者或专家路线' },
];

const CAREER_PATH_EN = [
  { stage: 'Onboard', icon: '🏠', desc: 'New hire onboarding + one-on-one mentorship' },
  { stage: 'Grow', icon: '📈', desc: 'Quarterly OKRs + advanced skill courses' },
  { stage: 'Breakthrough', icon: '🚀', desc: 'Cross-functional rotations + project lead opportunities' },
  { stage: 'Lead', icon: '⭐', desc: 'Advance on the management or expert track' },
];

export function getCareerTestimonials(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return CAREER_TESTIMONIALS_ZH;
  return CAREER_TESTIMONIALS_EN;
}

export function getCareerPath(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return CAREER_PATH_ZH;
  return CAREER_PATH_EN;
}

/** 兼容旧直接引用：默认中文 */
export const CAREER_TESTIMONIALS = CAREER_TESTIMONIALS_ZH;
export const CAREER_PATH = CAREER_PATH_ZH;
