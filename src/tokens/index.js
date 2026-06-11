/**
 * TalentPro Design Tokens
 * 唯一真相来源 — 所有颜色修改从此文件发起
 * global.css 中的 :root CSS 变量必须与本文件保持同步
 */

export const colors = {
  // 主色
  primary:      '#1B5FEB',
  primaryDark:  '#1347C8',
  primaryLight: '#EBF1FF',
  primaryGlow:  'rgba(27,95,235,0.15)',

  // 暗色系
  ink900: '#0D1526',
  ink800: '#1A2540',
  ink700: '#2B3A5C',

  // 中性色
  gray50:  '#F8FAFB',
  gray100: '#F0F4F8',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray350: '#D1D5DB',
  gray400: '#94A3B8',
  gray500: '#6B7280',
  gray600: '#475569',
  gray700: '#334155',
  gray900: '#0F172A',

  // 功能色
  aiPurple:       '#7C3AED',
  aiPurpleBg:     'rgba(124,58,237,0.25)',
  aiPurpleLighter:'#F3E8FF',
  aiPurpleLight:  '#C4B5FD',
  aiPurpleText:   '#A78BFA',
  success:        '#059669',
  error:          '#EF4444',
  errorLight:     '#FCA5A5',
  errorAlpha15:   'rgba(239,68,68,0.15)',
  warning:        '#D97706',
  warningBg:      '#FFF7ED',
  warningBorder:  '#FED7AA',
  warningText:    '#92400E',
  orange:         '#EA580C',
  greenText:      '#16A34A',

  // 标签辅助色
  tagBlueBg:   '#EFF6FF',
  tagBlueText: '#3B82F6',

  // Marketplace 扩展色
  indigo400:    '#818CF8',
  amber500:     '#F59E0B',
  amber400:     '#FBBF24',
  red400:       '#F87171',
  green500:     '#22C55E',
  green400:     '#4ADE80',
  rating:       '#F59E0B',

  // 视频背景
  videoBg: '#000',

  // Alpha tokens
  primaryAlpha8:  'rgba(27,95,235,0.08)',
  primaryAlpha10: 'rgba(27,95,235,0.10)',
  primaryAlpha12: 'rgba(27,95,235,0.12)',
  primaryAlpha18: 'rgba(27,95,235,0.18)',
  primaryAlpha20: 'rgba(27,95,235,0.20)',
  primaryAlpha30: 'rgba(27,95,235,0.30)',
  primaryAlpha35: 'rgba(27,95,235,0.35)',

  aiPurpleAlpha30: 'rgba(124,58,237,0.30)',

  errorAlpha12: 'rgba(239,68,68,0.12)',

  blackAlpha6:  'rgba(0,0,0,0.06)',
  blackAlpha8:  'rgba(0,0,0,0.08)',
  blackAlpha10: 'rgba(0,0,0,0.10)',
  blackAlpha12: 'rgba(0,0,0,0.12)',
  blackAlpha18: 'rgba(0,0,0,0.18)',
  blackAlpha20: 'rgba(0,0,0,0.20)',
  blackAlpha25: 'rgba(0,0,0,0.25)',
  blackAlpha30: 'rgba(0,0,0,0.30)',
  blackAlpha60: 'rgba(0,0,0,0.60)',
  gray500Alpha15: 'rgba(107,114,128,0.15)',

  whiteAlpha4:  'rgba(255,255,255,0.04)',
  whiteAlpha6:  'rgba(255,255,255,0.06)',
  whiteAlpha25: 'rgba(255,255,255,0.25)',
  whiteAlpha35: 'rgba(255,255,255,0.35)',

  // 基础色
  white: '#ffffff',
  black: '#000000',

  // 语义化颜色
  errorBg: '#FEF2F2',
};

export const gradients = {
  hero: 'linear-gradient(135deg, #0D1526 0%, #1B3A6B 55%, #1B5FEB 100%)',
  ai:   'linear-gradient(135deg, #1A0533 0%, #2D1B69 50%, #1B4FA8 100%)',
  cta:  'linear-gradient(90deg, #1B5FEB 0%, #0D3BB8 100%)',
  text: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
  primaryAi: 'linear-gradient(135deg, #1B5FEB, #7C3AED)',
  primaryLight: 'linear-gradient(135deg, #1B5FEB 0%, #818CF8 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  success: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
};

export const radii = {
  sm:   '6px',
  md:   '12px',
  lg:   '16px',
  xl:   '24px',
  pill: '999px',
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 16px rgba(0,0,0,0.10)',
  lg: '0 8px 32px rgba(0,0,0,0.12)',
  xl: '0 20px 60px rgba(0,0,0,0.18)',
};

export const typography = {
  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  sizes: {
    heroH1:    'clamp(32px, 4.5vw, 60px)',
    sectionH2: 'clamp(26px, 3.5vw, 42px)',
    cardH3:    'clamp(22px, 2.5vw, 32px)',
    subtitle:  '16px',
    body:      '15px',
    small:     '13px',
    label:     '12px',
    statNum:   'clamp(28px, 3.5vw, 44px)',
  },
  weights: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    black:    900,
  },
  lineHeights: {
    tight:   1.2,
    heading: 1.25,
    card:    1.4,
    body:    1.6,
    loose:   1.75,
  },
};

export const spacing = {
  containerMaxWidth: '1200px',
  containerPadding:  'clamp(16px, 3vw, 40px)',
  sectionPadding:    'clamp(60px, 8vw, 110px)',
  sectionHeaderGap:  '56px',
};

export const animation = {
  easeOut:    'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut:  'cubic-bezier(0.4, 0, 0.2, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  durations: {
    hover:      '150ms',
    card:       '300ms',
    reveal:     '700ms',
    hero:       '900ms',
    modal:      '350ms',
    carousel:   '500ms',
    dropdown:   '250ms',
    mobileMenu: '380ms',
  },
};

export const breakpoints = {
  tablet:  '768px',
  desktop: '1024px',
  wide:    '1280px',
};
