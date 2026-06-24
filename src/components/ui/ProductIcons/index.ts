/**
 * ProductIcons — 产品矩阵 SVG 图标库
 * 风格：线性（Outlined），stroke-width 2，currentColor，24×24 viewBox
 * 颜色由父容器 color 属性控制（currentColor）
 * 分类：HR SaaS(蓝) / AI Family(紫) / 人才测评(橙) / PaaS(绿)
 */

import { h } from 'vue';

const SVG_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* ═══════════════ HR SaaS — 蓝色 ═══════════════ */

/** 招聘管理：人形 + 放大镜 */
export function IconRecruit() {
  return h('svg', SVG_PROPS, [
    h('circle', { cx: 10, cy: 7, r: 4 }),
    h('path', { d: 'M2 21a8 8 0 0 1 10.93-7.47' }),
    h('circle', { cx: 17.5, cy: 17.5, r: 3 }),
    h('path', { d: 'm20 20 2 2' }),
  ]);
}

/** 绩效管理：折线图上升 */
export function IconPerformance() {
  return h('svg', SVG_PROPS, [
    h('polyline', { points: '2 17 7 12 11 15 16 9 22 5' }),
    h('path', { d: 'M2 3v18h20' }),
  ]);
}

/** 组织人事：组织架构树 */
export function IconOrg() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 9, y: 2, width: 6, height: 4, rx: 1 }),
    h('rect', { x: 2, y: 16, width: 6, height: 4, rx: 1 }),
    h('rect', { x: 9, y: 16, width: 6, height: 4, rx: 1 }),
    h('rect', { x: 16, y: 16, width: 6, height: 4, rx: 1 }),
    h('path', { d: 'M5 16v-4h14v4M12 6v6' }),
  ]);
}

/** 假勤管理：日历 + 时钟 */
export function IconAttendance() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 3, y: 4, width: 13, height: 13, rx: 2 }),
    h('path', { d: 'M8 2v4M12 2v4M3 10h13' }),
    h('circle', { cx: 18, cy: 18, r: 4 }),
    h('path', { d: 'M18 16v2l1.5 1.5' }),
  ]);
}

/** 薪酬管理：钱袋 */
export function IconPayroll() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M9.5 6.5c0-2 1.1-4 2.5-4s2.5 2 2.5 4' }),
    h('path', { d: 'M7 6.5h10l1 13H6L7 6.5z' }),
    h('path', { d: 'M12 10v4M9.5 12h5' }),
  ]);
}

/** 在线学习：书本 */
export function IconLearning() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
    h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }),
    h('path', { d: 'M8 7h8M8 11h5' }),
  ]);
}

/** 盘点发展：用户列表 + 星星 */
export function IconTalent() {
  return h('svg', SVG_PROPS, [
    h('circle', { cx: 9, cy: 7, r: 4 }),
    h('path', { d: 'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' }),
    h('path', { d: 'M19 8l.8 2.4L22 11l-2.2.6L19 14l-.8-2.4L16 11l2.2-.6z' }),
  ]);
}

/** 数字人力分析：柱状图 */
export function IconAnalytics() {
  return h('svg', SVG_PROPS, [
    h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
    h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
    h('line', { x1: 6, y1: 20, x2: 6, y2: 14 }),
    h('line', { x1: 2, y1: 20, x2: 22, y2: 20 }),
  ]);
}

/* ═══════════════ AI Family — 紫色 ═══════════════ */

/** AI 招聘助手：机器人 */
export function IconAIRecruit() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 3, y: 11, width: 18, height: 10, rx: 2 }),
    h('circle', { cx: 8.5, cy: 16, r: 1.5 }),
    h('circle', { cx: 15.5, cy: 16, r: 1.5 }),
    h('path', { d: 'M9 7a3 3 0 0 1 6 0v4H9V7z' }),
    h('path', { d: 'M9 11V7M15 11V7M12 3v2' }),
  ]);
}

/** AI 面试官：麦克风 */
export function IconAIInterview() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 9, y: 2, width: 6, height: 11, rx: 3 }),
    h('path', { d: 'M5 10a7 7 0 0 0 14 0' }),
    h('line', { x1: 12, y1: 19, x2: 12, y2: 22 }),
    h('line', { x1: 8, y1: 22, x2: 16, y2: 22 }),
  ]);
}

/** AI 领导力教练：闪电 */
export function IconAICoach() {
  return h('svg', SVG_PROPS, [
    h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
  ]);
}

/** AI 做课助手：铅笔 + 文档 */
export function IconAICourse() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }),
  ]);
}

/* ═══════════════ 人才测评 — 橙色 ═══════════════ */

/** 招聘测评：勾选表单 */
export function IconAssessRecruit() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M9 11l3 3L22 4' }),
    h('path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' }),
  ]);
}

/** 360度评估：循环箭头 */
export function IconAssess360() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
    h('path', { d: 'M3 3v5h5' }),
  ]);
}

/** 在线考试：试卷 */
export function IconAssessExam() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 5, y: 2, width: 14, height: 20, rx: 2 }),
    h('path', { d: 'M9 7h6M9 11h6M9 15h4' }),
  ]);
}

/** 人才模型：靶心 */
export function IconAssessModel() {
  return h('svg', SVG_PROPS, [
    h('circle', { cx: 12, cy: 12, r: 10 }),
    h('circle', { cx: 12, cy: 12, r: 6 }),
    h('circle', { cx: 12, cy: 12, r: 2 }),
  ]);
}

/* ═══════════════ PaaS 平台 — 绿色 ═══════════════ */

/** 低代码平台：积木 */
export function IconLowCode() {
  return h('svg', SVG_PROPS, [
    h('rect', { x: 2, y: 14, width: 8, height: 8, rx: 1 }),
    h('rect', { x: 14, y: 14, width: 8, height: 8, rx: 1 }),
    h('rect', { x: 8, y: 2, width: 8, height: 8, rx: 1 }),
    h('path', { d: 'M6 14v-4h12v4M12 10V2' }),
  ]);
}

/** 开放 API：代码括号 */
export function IconAPI() {
  return h('svg', SVG_PROPS, [
    h('polyline', { points: '16 18 22 12 16 6' }),
    h('polyline', { points: '8 6 2 12 8 18' }),
  ]);
}

/** 生态广场：六边形 */
export function IconEco() {
  return h('svg', SVG_PROPS, [
    h('polygon', { points: '12 2 19 6 19 14 12 18 5 14 5 6' }),
    h('circle', { cx: 12, cy: 10, r: 2 }),
    h('path', { d: 'M12 12v6M5 6l-3-2M19 6l3-2M5 14l-3 2M19 14l3 2' }),
  ]);
}

/** 安全合规：盾牌 + 勾 */
export function IconSecurity() {
  return h('svg', SVG_PROPS, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
    h('path', { d: 'M9 12l2 2 4-4' }),
  ]);
}

/* ═══════════════ 图标映射表 ═══════════════ */

/**
 * PRODUCT_ICONS — 产品 ID → 图标组件映射
 * 供 products.ts / aiFamily.js 通过 id 引用
 */
export const PRODUCT_ICONS = {
  // HR SaaS（蓝）
  recruit:     IconRecruit,
  performance: IconPerformance,
  org:         IconOrg,
  attendance:  IconAttendance,
  payroll:     IconPayroll,
  learning:    IconLearning,
  talent:      IconTalent,
  analytics:   IconAnalytics,
  // AI Family（紫）
  'ai-recruit':  IconAIRecruit,
  'ai-interview': IconAIInterview,
  'ai-coach':    IconAICoach,
  'ai-course':   IconAICourse,
  // 人才测评（橙）
  'assess-recruit': IconAssessRecruit,
  'assess-360':     IconAssess360,
  'assess-exam':    IconAssessExam,
  'assess-model':   IconAssessModel,
  // PaaS（绿）
  'paas-lowcode': IconLowCode,
  'paas-api':     IconAPI,
  'paas-eco':     IconEco,
  'paas-sec':     IconSecurity,
};

/** 分类颜色映射（写在容器 color 属性上，icon 用 currentColor） */
export const ICON_COLORS = {
  'hr-saas':    '#1B5FEB',  // 蓝
  'ai-family':  '#7C3AED',  // 紫
  'assessment': '#EA580C',  // 橙
  'paas':       '#059669',  // 绿
};

/** 分类图标背景色 */
export const ICON_BG_COLORS = {
  'hr-saas':    '#EBF1FF',
  'ai-family':  '#F3E8FF',
  'assessment': '#FFF7ED',
  'paas':       '#ECFDF5',
};
