/**
 * 应用广场静态 Fallback 数据
 * 当 CMS / API 不可用时作为降级数据使用
 * v2.0.0: 支持按 locale 返回对应语言数据
 */

import { APP_SMART_RESUME_SCREEN } from './apps/smart-resume-screen';
import { APP_PAYROLL_AUTO_CALC } from './apps/payroll-auto-calc';
import { APP_OKR_COPILOT } from './apps/okr-copilot';
import { APP_LMS_MICROLEARNING } from './apps/lms-microlearning';
import { APP_EMPLOYEE_PULSE } from './apps/employee-pulse';
import { APP_COMPLIANCE_GUARD } from './apps/compliance-guard';
import { APP_AI_INTERVIEW_BOT } from './apps/ai-interview-bot';
import { APP_HR_ANALYTICS_PRO } from './apps/hr-analytics-pro';
import { APP_CAMPUS_RECRUIT_SUITE } from './apps/campus-recruit-suite';
import { APP_BENEFITS_MARKETPLACE } from './apps/benefits-marketplace';
import { APP_TALENT_MAP_360 } from './apps/talent-map-360';
import { APP_ONBOARDING_EXPERIENCE } from './apps/onboarding-experience';

export const MARKETPLACE_APPS_ZH = [
  APP_SMART_RESUME_SCREEN,
  APP_PAYROLL_AUTO_CALC,
  APP_OKR_COPILOT,
  APP_LMS_MICROLEARNING,
  APP_EMPLOYEE_PULSE,
  APP_COMPLIANCE_GUARD,
  APP_AI_INTERVIEW_BOT,
  APP_HR_ANALYTICS_PRO,
  APP_CAMPUS_RECRUIT_SUITE,
  APP_BENEFITS_MARKETPLACE,
  APP_TALENT_MAP_360,
  APP_ONBOARDING_EXPERIENCE,
];

const MARKETPLACE_APPS_EN = [
  {
    ...APP_SMART_RESUME_SCREEN,
    name: 'Smart Resume Screening Pro',
    tagline: 'AI-driven resume parsing and intelligent matching',
    description: 'A deep-learning resume parsing engine supporting 50+ formats with automatic key-information extraction and precise job-profile matching. Integrates with TalentPro Recruiting to complete first-round screening in one click, reducing repetitive work by 80%. Supports multi-language resumes and cross-border talent evaluation.',
    pricingTiers: [
      { name: 'Basic', priceMonthly: 299, priceYearly: 2990, desc: '500 resumes/month', features: ['Resume parsing', 'Basic matching', 'Chinese support'] },
      { name: 'Pro', priceMonthly: 799, priceYearly: 7990, desc: '3,000 resumes/month', features: ['Resume parsing', 'AI match scoring', 'Multi-language', 'API access', 'Team collaboration'] },
      { name: 'Enterprise', priceMonthly: 1999, priceYearly: 19990, desc: 'Unlimited parsing', features: ['Unlimited parsing', 'Custom model training', 'Private deployment', 'Dedicated advisor', 'SLA guarantee'] },
    ],
    features: ['AI resume parsing', 'Job-profile matching', 'Multi-language', 'Batch processing', 'API integration', 'Analytics dashboard'],
  },
  {
    ...APP_PAYROLL_AUTO_CALC,
    name: 'Payroll Auto-Calc Assistant',
    tagline: 'One-click payroll, compliance assured',
    description: 'Automatically links attendance, performance, and social insurance data and supports real-time updates to individual income tax policies in 300+ Chinese cities. Identifies anomalies intelligently and generates payslips and reports with one click. Deeply integrated with TalentPro Payroll, payroll processing time is reduced from 5 days to 1 hour.',
    pricingTiers: [
      { name: 'Standard', priceMonthly: 599, priceYearly: 5990, desc: 'Up to 200 employees', features: ['Auto payroll', 'Tax filing', 'Payslip delivery'] },
      { name: 'Advanced', priceMonthly: 1299, priceYearly: 12990, desc: 'Up to 1,000 employees', features: ['Auto payroll', 'Tax filing', 'Social insurance', 'Cost analysis', 'Multi-books'] },
      { name: 'Group', priceMonthly: 3999, priceYearly: 39990, desc: 'Unlimited employees', features: ['Unlimited employees', 'Group consolidated reports', 'Private deployment', 'Custom development'] },
    ],
    features: ['Auto payroll', 'Real-time tax updates', 'Anomaly alerts', 'Payslip delivery', 'Cost analysis', 'Multi-book management'],
  },
  {
    ...APP_OKR_COPILOT,
    name: 'OKR Copilot',
    tagline: 'Goal alignment, execution delivered',
    description: 'A full-cycle OKR management tool from goal setting to execution review. Supports O-KR cascading, automatic progress sync, and automatic linkage to performance results. Built-in industry benchmark templates help teams get started quickly. Seamlessly integrated with TalentPro Performance.',
    pricingTiers: [
      { name: 'Free', priceMonthly: 0, priceYearly: 0, desc: 'Up to 10 people', features: ['Goal creation', 'Progress tracking', 'Basic reports'] },
      { name: 'Team', priceMonthly: 399, priceYearly: 3990, desc: 'Up to 50 people', features: ['Goal alignment', 'Auto sync', 'Advanced reports', 'Integration'] },
      { name: 'Enterprise', priceMonthly: 999, priceYearly: 9990, desc: 'Unlimited people', features: ['Unlimited people', 'Custom workflows', 'Open API', 'Dedicated support'] },
    ],
    features: ['O-KR cascading', 'Auto progress sync', 'Performance linkage', 'Template library', 'Analytics dashboard', 'Mobile support'],
  },
  {
    ...APP_LMS_MICROLEARNING,
    name: 'Microlearning Platform',
    tagline: 'Bite-sized learning, structured growth',
    description: 'Supports full-cycle learning management for micro-courses, live sessions, exams, and certifications. AI recommends personalized learning paths so employees can build capabilities in spare moments. Deeply integrated with TalentPro Learning; learning records sync automatically.',
    pricingTiers: [
      { name: 'Growth', priceMonthly: 499, priceYearly: 4990, desc: 'Up to 100 people', features: ['Micro-course management', 'Exam system', 'Learning records'] },
      { name: 'Pro', priceMonthly: 1199, priceYearly: 11990, desc: 'Up to 500 people', features: ['Live classroom', 'AI recommendations', 'Certification management', 'Analytics'] },
      { name: 'Academy', priceMonthly: 2999, priceYearly: 29990, desc: 'Unlimited people', features: ['Unlimited people', 'Custom development', 'Content co-creation', 'Private deployment'] },
    ],
    features: ['Micro-course builder', 'Live classroom', 'AI recommendations', 'Exam certification', 'Learning maps', 'Data reports'],
  },
  {
    ...APP_EMPLOYEE_PULSE,
    name: 'Employee Pulse Insights',
    tagline: 'Sense employee sentiment in real time and proactively improve retention',
    description: 'Uses anonymous surveys, sentiment analysis, and turnover risk signals to gain real-time insight into employee satisfaction and engagement. AI automatically identifies at-risk teams and pushes intervention recommendations. Linked with TalentPro HR & Organization for automatic analysis with entry and exit data.',
    pricingTiers: [
      { name: 'Survey', priceMonthly: 399, priceYearly: 3990, desc: '1 survey/month', features: ['Questionnaire templates', 'Basic analysis', 'Anonymous feedback'] },
      { name: 'Insights', priceMonthly: 899, priceYearly: 8990, desc: 'Unlimited surveys', features: ['Sentiment analysis', 'Turnover alerts', 'Team comparison', 'Action plans'] },
      { name: 'Strategic', priceMonthly: 2499, priceYearly: 24990, desc: 'Full features', features: ['Custom models', 'Advisor services', 'Integration', 'Annual whitepaper'] },
    ],
    features: ['Anonymous surveys', 'Sentiment analysis', 'Turnover alerts', 'Team comparison', 'Action recommendations', 'Data export'],
  },
  {
    ...APP_COMPLIANCE_GUARD,
    name: 'Compliance Guard',
    tagline: 'Automatically track regulatory changes and reduce employment risk',
    description: 'Tracks national labor regulations, tax policies, and social insurance base changes in real time, automatically pushing impact analysis and response recommendations. Built-in 20+ alert rules for contract expiry, certification expiry, and probation expiry. Linked with TalentPro HR & Organization; alerts directly trigger workflows.',
    pricingTiers: [
      { name: 'Standard', priceMonthly: 699, priceYearly: 6990, desc: 'Basic regulation tracking', features: ['Regulation tracking', 'Policy alerts', 'Basic warnings'] },
      { name: 'Enterprise', priceMonthly: 1699, priceYearly: 16990, desc: 'Full features', features: ['Full regulation coverage', 'Smart alerts', 'Expert consulting', 'Custom reports', 'Integration'] },
    ],
    features: ['Regulation tracking', 'Policy alerts', 'Smart warnings', 'Risk assessment', 'Expert consulting', 'Custom reports'],
  },
  {
    ...APP_AI_INTERVIEW_BOT,
    name: 'AI Interview Bot',
    tagline: '24/7 automated interviews with precise potential assessment',
    description: 'An intelligent interviewer based on large language models, supporting structured, behavioral, and situational interview modes. Automatically evaluates candidate capability, potential, and culture fit, generating detailed interview reports. Deeply integrated with TalentPro AI Interviewer; supports video, voice, and text interactions.',
    pricingTiers: [
      { name: 'Trial', priceMonthly: 0, priceYearly: 0, desc: '50 interviews/month', features: ['Text interview', 'Basic report', 'Chinese support'] },
      { name: 'Pro', priceMonthly: 999, priceYearly: 9990, desc: '1,000 interviews/month', features: ['Video interview', 'Voice interview', 'Potential assessment', 'Custom question bank', 'API access'] },
      { name: 'Enterprise', priceMonthly: 2999, priceYearly: 29990, desc: 'Unlimited interviews', features: ['Unlimited interviews', 'Private model', 'Custom assessment dimensions', 'Dedicated advisor'] },
    ],
    features: ['Video interview', 'Voice interview', 'Potential assessment', 'Custom question bank', 'Multi-language', 'Analytics dashboard'],
  },
  {
    ...APP_HR_ANALYTICS_PRO,
    name: 'HR Analytics Pro',
    tagline: '400+ metrics, one-click executive reports',
    description: 'Pre-built 400+ HR industry metrics and executive cockpit templates with drag-and-drop custom reporting. Automatically connects to all TalentPro modules for full-chain insights from recruiting funnel to turnover analysis. Supports predictive analytics to identify talent risks early.',
    pricingTiers: [
      { name: 'Analytics', priceMonthly: 799, priceYearly: 7990, desc: 'Standard reports', features: ['Pre-built reports', 'Basic drag-and-drop', 'Data export'] },
      { name: 'Pro', priceMonthly: 1999, priceYearly: 19990, desc: 'Custom analytics', features: ['Custom reports', 'Predictive analytics', 'Executive cockpit', 'Drill-down'] },
      { name: 'Platform', priceMonthly: 4999, priceYearly: 49990, desc: 'Data mid-platform', features: ['Data warehouse', 'ETL tools', 'Custom development', 'Dedicated architect'] },
    ],
    features: ['400+ metrics', 'Drag-and-drop reports', 'Predictive analytics', 'Executive cockpit', 'Data drill-down', 'Auto push'],
  },
  {
    ...APP_CAMPUS_RECRUIT_SUITE,
    name: 'Campus Recruiting Suite',
    tagline: 'From info sessions to offers, full-cycle digital campus recruiting',
    description: 'Covers the full campus recruiting chain from info sessions and resume collection to AI prescreening, online assessment, interview scheduling, and offer issuance. Features university maps, info-session management, and referral tracking. Deeply integrated with TalentPro Recruiting; campus cycles are shortened by an average of 40%.',
    pricingTiers: [
      { name: 'Season', priceMonthly: 1299, priceYearly: 12990, desc: 'Single season', features: ['Resume collection', 'Session management', 'Online assessment', 'Interview scheduling'] },
      { name: 'Annual', priceMonthly: 799, priceYearly: 7990, desc: 'Year-round', features: ['Full features', 'AI prescreening', 'Referral tracking', 'University map', 'Analytics'] },
      { name: 'Group', priceMonthly: 2499, priceYearly: 24990, desc: 'Multi-brand campus recruiting', features: ['Multi-brand management', 'Custom development', 'Private deployment', 'Dedicated advisor'] },
    ],
    features: ['Session management', 'Resume collection', 'AI prescreening', 'Online assessment', 'Offer management', 'Analytics dashboard'],
  },
  {
    ...APP_BENEFITS_MARKETPLACE,
    name: 'Flexible Benefits Marketplace',
    tagline: 'Employee-chosen benefits with controllable costs',
    description: 'Integrates 1,000+ benefit products including insurance, health checks, fitness, dining, and travel; employees redeem with points. Employers can set budget caps and product whitelists for precise benefits cost control. Linked with TalentPro Payroll for automatic point issuance and deduction.',
    pricingTiers: [
      { name: 'Starter', priceMonthly: 299, priceYearly: 2990, desc: 'Up to 100 people', features: ['Basic marketplace', 'Points management', 'Standard products'] },
      { name: 'Growth', priceMonthly: 699, priceYearly: 6990, desc: 'Up to 500 people', features: ['Custom marketplace', 'Budget control', 'Analytics', 'API access'] },
      { name: 'Enterprise', priceMonthly: 1999, priceYearly: 19990, desc: 'Unlimited people', features: ['Unlimited people', 'Custom products', 'Private deployment', 'Dedicated operations'] },
    ],
    features: ['Benefits marketplace', 'Points management', 'Budget control', 'Employee choice', 'Analytics', 'Mobile support'],
  },
  {
    ...APP_TALENT_MAP_360,
    name: 'Talent Map 360',
    tagline: 'Visualize talent distribution, make precise succession decisions',
    description: 'Automatically generates enterprise talent maps based on 9-box grids, competency models, and performance data. Supports multi-dimensional filtering and comparison to quickly identify high potentials and succession gaps. Linked with TalentPro Talent Review; review results automatically update the map.',
    pricingTiers: [
      { name: 'Team', priceMonthly: 599, priceYearly: 5990, desc: 'Single department', features: ['Talent map', '9-box grid', 'Basic comparison'] },
      { name: 'Enterprise', priceMonthly: 1499, priceYearly: 14990, desc: 'Whole company', features: ['Company-wide map', 'Succession planning', 'Scenario simulation', 'Integration'] },
    ],
    features: ['Talent map', '9-box grid', 'Succession planning', 'Scenario simulation', 'Data drill-down', 'Export reports'],
  },
  {
    ...APP_ONBOARDING_EXPERIENCE,
    name: 'Onboarding Experience Manager',
    tagline: 'Make new hires feel at home from day one',
    description: 'Full-cycle onboarding management from offer acceptance to confirmation. Auto-pushes onboarding tasks, mentor matching, and culture integration courses. Supports e-signing, device requests, and seat booking in one place. Deeply integrated with TalentPro HR & Organization; onboarding data syncs automatically.',
    pricingTiers: [
      { name: 'Free', priceMonthly: 0, priceYearly: 0, desc: 'Up to 20 people/month', features: ['Onboarding tasks', 'E-signing', 'Basic reports'] },
      { name: 'Pro', priceMonthly: 499, priceYearly: 4990, desc: 'Up to 100 people/month', features: ['Mentor matching', 'Culture courses', 'Experience scoring', 'Analytics'] },
      { name: 'Enterprise', priceMonthly: 1299, priceYearly: 12990, desc: 'Unlimited people', features: ['Unlimited people', 'Custom workflows', 'Integration', 'Dedicated advisor'] },
    ],
    features: ['Onboarding tasks', 'E-signing', 'Mentor matching', 'Culture courses', 'Experience scoring', 'Analytics dashboard'],
  },
];

export function getMarketplaceApps(locale?: string) {
  if (locale === 'en') return MARKETPLACE_APPS_EN;
  return MARKETPLACE_APPS_ZH;
}

export function getMarketplaceAppMap(locale?: string) {
  return Object.fromEntries(getMarketplaceApps(locale).map((app: any) => [app.slug, app]));
}

/** 兼容旧直接引用：默认中文 */
export const MARKETPLACE_APPS = MARKETPLACE_APPS_ZH;
export const MARKETPLACE_APP_MAP = Object.fromEntries(
  MARKETPLACE_APPS_ZH.map((app) => [app.slug, app]),
);

export { MARKETPLACE_CATEGORIES, getMarketplaceCategories } from './categories';
export { MARKETPLACE_REVIEWS, getMarketplaceReviews } from './reviews';
