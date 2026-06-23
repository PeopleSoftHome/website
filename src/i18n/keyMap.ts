/**
 * 产品 ID → i18n key 映射
 * 用于 products.ts 中连字符 ID 到 JSON camelCase key 的转换
 */
export const PRODUCT_KEY_MAP = {
  'recruit':        'recruit',
  'performance':    'performance',
  'org':            'org',
  'attendance':     'attendance',
  'payroll':        'payroll',
  'learning':       'learning',
  'talent':         'talent',
  'analytics':      'analytics',
  'ai-recruit':     'aiRecruit',
  'ai-interview':   'aiInterview',
  'ai-coach':       'aiCoach',
  'ai-course':      'aiCourse',
  'assess-recruit': 'assessRecruit',
  'assess-360':     'assess360',
  'assess-exam':    'assessExam',
  'assess-model':   'assessModel',
  'paas-lowcode':   'paasLowcode',
  'paas-api':       'paasApi',
  'paas-eco':       'paasEco',
  'paas-sec':       'paasSec',
};

/** Tab ID → i18n key */
export const TAB_KEY_MAP = {
  'hr-saas':    'hrSaas',
  'ai-family':  'aiFamily',
  'assessment': 'assessment',
  'paas':       'paas',
};

/** AI card ID → i18n key */
export const AI_CARD_KEY_MAP = {
  'ai-recruit':  'aiRecruit',
  'ai-interview':'aiInterview',
  'ai-coach':    'aiCoach',
  'ai-learning': 'aiLearning',
};

/** Industry tab ID → i18n key */
export const INDUSTRY_KEY_MAP = {
  'mfg':           'mfg',
  'manufacturing': 'mfg',
  'retail':        'retail',
  'internet':      'internet',
  'gov':           'gov',
  'finance':       'finance',
};
