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

export const MARKETPLACE_APPS = [
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

export const MARKETPLACE_APP_MAP = Object.fromEntries(
  MARKETPLACE_APPS.map((app) => [app.slug, app]),
);

export { MARKETPLACE_CATEGORIES } from './categories';
export { MARKETPLACE_REVIEWS as REVIEWS } from './reviews';
