/**
 * 个人中心页面 fallback 数据
 * v4.2.0：支持按 locale 返回对应语言数据
 */

export const ORDER_STATUSES = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'pending', labelKey: 'profile.orderStatus.pending' },
  { value: 'completed', labelKey: 'profile.orderStatus.completed' },
  { value: 'refunded', labelKey: 'profile.orderStatus.refunded' },
];

const ORDER_FALLBACK_ZH = [
  { id: 'ORD-20260601-001', appName: 'AI 招聘助手 Pro', amount: 2999, status: 'completed', date: '2026-06-01', icon: '🤖' },
  { id: 'ORD-20260515-002', appName: '绩效管理系统', amount: 5999, status: 'completed', date: '2026-05-15', icon: '📊' },
  { id: 'ORD-20260610-003', appName: '组织人事系统', amount: 8999, status: 'pending', date: '2026-06-10', icon: '🏢' },
  { id: 'ORD-20260420-004', appName: '薪酬管理系统', amount: 4999, status: 'refunded', date: '2026-04-20', icon: '💰' },
];

const ORDER_FALLBACK_EN = [
  { id: 'ORD-20260601-001', appName: 'AI Recruiter Pro', amount: 2999, status: 'completed', date: '2026-06-01', icon: '🤖' },
  { id: 'ORD-20260515-002', appName: 'Performance Management', amount: 5999, status: 'completed', date: '2026-05-15', icon: '📊' },
  { id: 'ORD-20260610-003', appName: 'HR & Organization', amount: 8999, status: 'pending', date: '2026-06-10', icon: '🏢' },
  { id: 'ORD-20260420-004', appName: 'Payroll Management', amount: 4999, status: 'refunded', date: '2026-04-20', icon: '💰' },
];

const ACTIVITIES_ZH = [
  { type: 'order', textKey: 'profile.activityOrder', date: '2026-06-01 14:32' },
  { type: 'login', textKey: 'profile.activityLogin', date: '2026-06-10 09:15' },
  { type: 'review', textKey: 'profile.activityReview', date: '2026-05-28 16:40' },
  { type: 'install', textKey: 'profile.activityInstall', date: '2026-05-15 11:20' },
  { type: 'update', textKey: 'profile.activityUpdate', date: '2026-05-10 10:05' },
];

const ACTIVITIES_EN = [
  { type: 'order', textKey: 'profile.activityOrder', date: '2026-06-01 14:32' },
  { type: 'login', textKey: 'profile.activityLogin', date: '2026-06-10 09:15' },
  { type: 'review', textKey: 'profile.activityReview', date: '2026-05-28 16:40' },
  { type: 'install', textKey: 'profile.activityInstall', date: '2026-05-15 11:20' },
  { type: 'update', textKey: 'profile.activityUpdate', date: '2026-05-10 10:05' },
];

const LOGIN_HISTORY_ZH = [
  { date: '2026-06-10 09:15', device: 'Chrome / macOS', ip: '192.168.1.***', location: '北京', current: true },
  { date: '2026-06-09 18:30', device: 'Safari / iOS', ip: '192.168.2.***', location: '北京', current: false },
  { date: '2026-06-08 14:10', device: 'Firefox / Windows', ip: '192.168.3.***', location: '上海', current: false },
  { date: '2026-06-05 09:00', device: 'Chrome / macOS', ip: '192.168.1.***', location: '北京', current: false },
];

const LOGIN_HISTORY_EN = [
  { date: '2026-06-10 09:15', device: 'Chrome / macOS', ip: '192.168.1.***', location: 'Beijing', current: true },
  { date: '2026-06-09 18:30', device: 'Safari / iOS', ip: '192.168.2.***', location: 'Beijing', current: false },
  { date: '2026-06-08 14:10', device: 'Firefox / Windows', ip: '192.168.3.***', location: 'Shanghai', current: false },
  { date: '2026-06-05 09:00', device: 'Chrome / macOS', ip: '192.168.1.***', location: 'Beijing', current: false },
];

export function getOrderFallback(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return ORDER_FALLBACK_ZH;
  return ORDER_FALLBACK_EN;
}

export function getActivities(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return ACTIVITIES_ZH;
  return ACTIVITIES_EN;
}

export function getLoginHistory(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return LOGIN_HISTORY_ZH;
  return LOGIN_HISTORY_EN;
}

/** 兼容旧直接引用：默认中文 */
export const ORDER_FALLBACK = ORDER_FALLBACK_ZH;
export const ACTIVITIES = ACTIVITIES_ZH;
export const LOGIN_HISTORY = LOGIN_HISTORY_ZH;
