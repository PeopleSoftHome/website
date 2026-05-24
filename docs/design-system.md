# TalentPro HR Portal — 设计系统文档

> **版本**：v1.0.0 | **负责角色**：前端设计师 Agent | **状态**：✅ 完成，待 PO 确认
> **最后更新**：2026-03-15
> **来源基线**：`TalentPro_PRD_v1_0_0.md §3` + `TalentPro_demo_v1_2_0.html`（CSS 变量提炼）

---

## 目录

1. [设计令牌（Design Tokens）](#1-设计令牌design-tokens)
2. [字体系统](#2-字体系统)
3. [间距与布局](#3-间距与布局)
4. [圆角与阴影](#4-圆角与阴影)
5. [动效规范](#5-动效规范)
6. [Section 背景规则](#6-section-背景规则)
7. [原子组件规范](#7-原子组件规范)
8. [响应式规范](#8-响应式规范)
9. [无障碍规范](#9-无障碍规范)
10. [Design Tokens JS 文件](#10-design-tokens-js-文件)

---

## 1. 设计令牌（Design Tokens）

### 1.1 色彩系统

#### 主色调

| Token | 色值 | 用途 |
|-------|------|------|
| `--primary` | `#1B5FEB` | 主 CTA、链接、关键图标、强调元素 |
| `--primary-dark` | `#1347C8` | 主色 hover 态 |
| `--primary-light` | `#EBF1FF` | 背景色块、Tag 背景、轻量强调 |
| `--primary-glow` | `rgba(27,95,235,0.15)` | 按钮 hover 阴影、卡片聚焦光晕 |

#### 暗色系

| Token | 色值 | 用途 |
|-------|------|------|
| `--ink-900` | `#0D1526` | Hero 背景、WhyUs 区背景 |
| `--ink-800` | `#1A2540` | 深色卡片备用 |
| `--ink-700` | `#2B3A5C` | 深色次级背景 |

#### 中性色阶

| Token | 色值 | 用途 |
|-------|------|------|
| `--gray-50` | `#F8FAFB` | 交替 Section 背景（偶数区块）|
| `--gray-100` | `#F0F4F8` | 卡片背景、Tab 条背景 |
| `--gray-200` | `#E2E8F0` | 分割线、边框 |
| `--gray-300` | `#CBD5E1` | Logo 墙默认态文字 |
| `--gray-400` | `#94A3B8` | 占位符、次要 meta 文字 |
| `--gray-600` | `#475569` | 正文次级文字 |
| `--gray-700` | `#334155` | 次级标题 |
| `--gray-900` | `#0F172A` | 正文主色 |

#### 功能色

| Token | 色值 | 用途 |
|-------|------|------|
| `--ai-purple` | `#7C3AED` | AI 专区高亮、AI 产品标记 |
| `--ai-purple-bg` | `rgba(124,58,237,0.25)` | AI 专区 Tag 背景 |
| `--success` | `#059669` | 正向状态、勾选、成功指标 |
| `--error` | `#EF4444` | 表单错误、Badge-HOT |
| `--warning` | `#D97706` | 警示标签 |
| `--orange` | `#EA580C` | 白皮书 Tag 文字 |
| `--green-text` | `#16A34A` | 案例集 Tag 文字 |

#### 渐变配方

| Token | 色值 | 用途 |
|-------|------|------|
| `--grad-hero` | `linear-gradient(135deg, #0D1526 0%, #1B3A6B 55%, #1B5FEB 100%)` | Hero Section 背景 |
| `--grad-ai` | `linear-gradient(135deg, #1A0533 0%, #2D1B69 50%, #1B4FA8 100%)` | AI 专区背景 |
| `--grad-cta` | `linear-gradient(90deg, #1B5FEB 0%, #0D3BB8 100%)` | 底部 CTA 通栏 |
| `--grad-text` | `linear-gradient(135deg, #60A5FA, #A78BFA)` | Logo 渐变字、Hero 关键词渐变 |

---

## 2. 字体系统

### 2.1 字体栈

```css
font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

Google Fonts 引入：`Noto Sans SC:wght@400;500;600;700;900`

### 2.2 字号规范

| 用途 | CSS 值 | 字重 | 行高 |
|------|--------|------|------|
| Hero H1 | `clamp(32px, 4.5vw, 60px)` | 700 | 1.2 |
| 区块标题 H2 | `clamp(26px, 3.5vw, 42px)` | 700 | 1.25 |
| 卡片标题 H3 | `clamp(22px, 2.5vw, 32px)` | 600 | 1.4 |
| Section 副标题 | `16–17px` | 400 | 1.6 |
| 正文 | `15px` | 400 | 1.6 |
| 小号正文 / meta | `13–14px` | 400 | 1.75 |
| 标签 / Badge | `11–12px` | 600 | — |
| 统计数字 | `clamp(28px, 3.5vw, 44px)` | 900 | 1.1 |
| Logo 文字 | `22px` | 900 | — |
| 导航链接 | `14px` | 500 | — |

### 2.3 渐变文字写法（跨浏览器）

```css
.gradientText {
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 3. 间距与布局

### 3.1 容器宽度

| 用途 | 宽度 | Padding |
|------|------|---------|
| 主容器 `.container` | `max-width: 1200px` | `clamp(16px, 3vw, 40px)` 左右 |

### 3.2 Section 间距

| 场景 | 值 |
|------|-----|
| 标准 Section padding | `clamp(60px, 8vw, 110px) 0` |
| Section Header 下间距 | `margin-bottom: 56px` |
| 紧凑 Section（统计 / Logo 墙）| `48px 0` |

### 3.3 卡片网格

| 网格类型 | Desktop (≥1024) | Tablet (768-1023) | Mobile (<768) |
|---------|----------------|------------------|--------------|
| 产品卡片 | 4 列 | 2 列 | 1 列 |
| AI 卡片 | 4 列（含跨 2 列 Banner）| 2 列 | 1 列 |
| 行业截图卡 | 左右各 50% | 上下堆叠 | 上下堆叠 |
| 证言轮播 | 3 列（动态）| 2 列 | 1 列 |
| Logo 墙 | 6 列 | 3 列 | 3 列 |
| WhyUs 指标卡 | 4 列 | 2 列 | 1 列 |
| 底部统计条 | 6 列 | 3 列 | 2 列 |
| 资源卡片 | 3 列 | 2 列 | 1 列 |
| 页脚 | 4 列 | 2 列 | 1 列 |

### 3.4 间距基准单位

基于 4px 系统，关键值：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px`

---

## 4. 圆角与阴影

### 4.1 圆角

| Token | 值 | 适用 |
|-------|-----|------|
| `--radius-sm` | `6px` | Tag、Badge、小按钮、导航链接 hover |
| `--radius-md` | `12px` | 标准卡片、主按钮、输入框 |
| `--radius-lg` | `16px` | 大卡片、弹窗 |
| `--radius-xl` | `24px` | Feature 高亮框、行业预览卡 |
| `--radius-pill` | `999px` | 胶囊标签、圆形按钮、ScrollTag |

### 4.2 阴影

| Token | 值 | 适用 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | 卡片默认态 |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.10)` | 卡片 hover 态 |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` | 浮动操作栏、固定导航 |
| `--shadow-xl` | `0 20px 60px rgba(0,0,0,0.18)` | 弹窗、Hero 设备截图 |

---

## 5. 动效规范

### 5.1 缓动函数

| 名称 | 值 | 用途 |
|------|-----|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 入场动画（全局首选）|
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 状态切换 |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性微交互（Button hover）|

### 5.2 时长规范

| 场景 | 时长 |
|------|------|
| Hover 状态切换 | `150–200ms` |
| 卡片 / 元素过渡 | `300ms` |
| Section 入场（reveal）| `700ms` |
| Hero 大标题 | `900ms` |
| 弹窗入场 | `350ms` |
| 轮播切换 | `500ms` |
| 下拉菜单 | `250ms` |
| 移动端菜单侧滑 | `380ms` |

### 5.3 滚动入场动画（Reveal 系统）

```css
/* reveal.css */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }

/* 减弱动效支持 */
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal.is-visible { opacity: 1; transform: none; transition: none; }
}
```

### 5.4 关键帧定义（`animations.css`）

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: none; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-16px); }
}
/* 用于 Hero 设备截图浮动，duration: 6s, iteration: infinite */

@keyframes gradShift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
/* 用于 Hero 渐变关键词动画，duration: 4s */

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
/* 用于品牌滚动栏，duration: 25s, iteration: infinite, timing: linear */

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.3); opacity: 0.7; }
}
/* 用于 Hero Tag 左侧绿点，duration: 2s */
```

---

## 6. Section 背景规则

背景交替规则确保相邻 Section 之间有明显区分（禁止连续两个相同背景）：

| Section | 背景 | 前景色 |
|---------|------|-------|
| SEC-01 导航（初始）| 透明 | 白色文字 |
| SEC-01 导航（scrolled）| 白色 + 毛玻璃 | 深色文字 |
| SEC-02 Hero | `--grad-hero` | 白色 |
| SEC-03 品牌滚动 | 白色 | 深色 |
| SEC-04 统计区 | `--gray-50` | 深色 |
| SEC-05 产品矩阵 | 白色 | 深色 |
| SEC-06 AI 专区 | `--grad-ai` | 白色 |
| SEC-07 行业方案 | `--gray-50` | 深色 |
| SEC-08 证言轮播 | 白色 | 深色 |
| SEC-09 Logo 墙 | `--gray-50` | 深色 |
| SEC-10 为什么选我们 | `--ink-900` | 白色 |
| SEC-11 资源中心 | 白色 | 深色 |
| SEC-12 底部 CTA | `--grad-cta` | 白色 |
| SEC-13 页脚 | `--gray-900` | 白色 |

---

## 7. 原子组件规范

### 7.1 Button 组件

**Variants：**

| Variant | 背景 | 文字 | 边框 | 用途 |
|---------|------|------|------|------|
| `primary` | `--primary` | white | — | 主 CTA |
| `ghost` | `rgba(255,255,255,0.12)` | white | `rgba(255,255,255,0.3)` | 深色背景次级 |
| `outline` | transparent | `--primary` | `--primary` | 浅色背景次级 |
| `white` | white | `--primary` | — | 蓝色背景上的 CTA |

**尺寸规范：**

| 场景 | Padding | FontSize | BorderRadius |
|------|---------|----------|--------------|
| 标准按钮 | `9px 20px` | `14px` | `--radius-md` |
| 导航按钮 | `7px 16–18px` | `14px` | `--radius-md` |
| Hero CTA | `14px 28px` | `16px` | `--radius-md` |
| 移动端 CTA | 全宽 `height: 46px` | `15px` | `--radius-md` |
| 弹窗提交 | 全宽 `height: 48px` | `15px` | `--radius-md` |

**Hover 状态：**
- `primary`：`background: --primary-dark`，`translateY(-1px)`，`box-shadow: 0 4px 12px --primary-glow`
- `ghost`：`background: rgba(255,255,255,0.2)`
- `outline`：`background: --primary-light`

### 7.2 Tag / SectionTag 组件

```
默认 Tag（浅色区块）：
  background: --primary-light
  color: --primary
  font-size: 12px, font-weight: 600
  padding: 5px 14px
  border-radius: --radius-pill
  letter-spacing: 0.05em

dark variant（深色区块，AI 专区）：
  background: rgba(124,58,237,0.25)
  color: rgba(167,139,250,1)
  border: 1px solid rgba(124,58,237,0.4)
```

### 7.3 Badge 组件

```
HOT Badge：
  background: --error (#EF4444)
  color: white
  font-size: 11px, font-weight: 700
  padding: 2px 8px
  border-radius: --radius-pill

类型 Tag（资源卡片）：
  白皮书：background: #FFF7ED, color: #EA580C
  案例集：background: #F0FDF4, color: #16A34A
  干货文章：background: --primary-light, color: --primary
  直播视频（v2.1.0）：background: #FDF4FF, color: #7C3AED
```

### 7.4 ProductCard 组件

```
容器：
  border: 1px solid --gray-200
  border-radius: --radius-md
  padding: 20px
  background: white
  transition: all 300ms --ease-out

图标区：
  尺寸：52×52px
  border-radius: --radius-md
  background: --primary-light
  font-size: 24px（Emoji，v2.1.0 替换为 SVG）

文字：
  名称：15px, font-weight: 600, color: --gray-900
  描述：13px, color: --gray-400, line-height: 1.75, 限 2 行
  链接：13px, color: --primary

hover 态：
  border-color: --primary
  transform: translateY(-4px)
  box-shadow: 0 8px 24px --primary-glow
```

### 7.5 AiCard 组件（玻璃态）

```
容器：
  background: rgba(255,255,255,0.07)
  backdrop-filter: blur(12px)
  border: 1px solid rgba(255,255,255,0.12)
  border-radius: --radius-lg

hover 态：
  border-color: rgba(124,58,237,0.6)
  transform: translateY(-4px)

HOT 徽章：绝对定位右上角
```

### 7.6 SectionHeader 组件

```
结构：[Tag] → [H2] → [Subtitle]
对齐：居中
Tag 下间距：margin-bottom: 16px
H2 下间距：margin-bottom: 12px
Subtitle：max-width: 560px, margin: 0 auto, color: --gray-600

dark variant（深色 Section）：
  H2: color: white
  Subtitle: color: rgba(255,255,255,0.6)
```

### 7.7 TabNav 组件

**pill 样式（行业方案 / WhyUs）：**

```
未激活：
  border: 1px solid --gray-200
  background: white
  color: --gray-700
  border-radius: --radius-pill
  padding: 8px 20px

激活：
  background: --primary
  color: white
  border-color: --primary
```

**underline 样式（产品矩阵）：**

```
未激活：color: --gray-600, border-bottom: 2px solid transparent
激活：color: --primary, border-bottom: 2px solid --primary, font-weight: 600
```

### 7.8 DemoModal 弹窗

```
遮罩：
  background: rgba(0,0,0,0.55)
  backdrop-filter: blur(4px)

弹窗容器：
  max-width: 500px
  border-radius: --radius-lg
  box-shadow: --shadow-xl
  入场：translateY(20px) → 0, 350ms --ease-out

步骤指示器（3 块）：
  待处理：--gray-200
  激活中：--primary
  已完成：--success

输入框：
  height: 44px
  border: 1px solid --gray-200
  border-radius: --radius-md
  focus：border-color: --primary, box-shadow: 0 0 0 3px --primary-glow
  error：border-color: --error

产品 Pill（多选）：
  border: 1px solid --gray-200, border-radius: --radius-pill
  selected：background: --primary-light, border-color: --primary, color: --primary
```

### 7.9 FloatingBar 组件

**桌面（≥ 768px）：** 固定右侧 `right: 20px, bottom: 100px`，垂直排列 4 个 40×40px 圆形按钮

**移动端（< 768px）：** 底部固定横排，高度 `56px`，3 个操作（咨询 | 电话 | 预约演示），预约演示占 50% 宽度

**Hover 展开标签：** 向左展开，`right: calc(100% + 12px)`，黑底白字，`border-radius: --radius-sm`

---

## 8. 响应式规范

### 8.1 断点定义

```css
/* 断点使用 min-width（Mobile First 写法）*/
/* 或 max-width（组件内局部响应式）*/

--bp-tablet:   768px   /* Tablet 起始 */
--bp-desktop:  1024px  /* Desktop S 起始 */
--bp-wide:     1280px  /* 标准桌面 */
```

### 8.2 导航响应式

```
≥ 1024px：完整导航（Logo + 链接 + 右侧按钮）
768–1023px：Hamburger 模式（链接隐藏，保留 Logo + 右侧 CTA）
< 768px：Hamburger 模式，显示移动全屏菜单
```

### 8.3 Hero 响应式

```
≥ 768px：左右 2 列（文字 + Dashboard 截图）
< 768px：仅文字列，隐藏右侧 Dashboard 装饰
```

---

## 9. 无障碍规范

| 要求 | 实现方式 |
|------|---------|
| 颜色对比度 | 主色 `#1B5FEB` on white：WCAG AA ✓（4.7:1）|
| 焦点可见 | 所有交互元素有 `:focus-visible` outline |
| 键盘导航 | Tab 可遍历导航链接、按钮、表单；ESC 关闭弹窗 |
| 语义 HTML | `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>` 正确使用 |
| ARIA | 弹窗添加 `role="dialog"` + `aria-modal="true"`；Tab 添加 `aria-selected` |
| 减弱动效 | `prefers-reduced-motion: reduce` 禁用所有 transform/animation |

---

## 10. Design Tokens JS 文件

> 对应文件：`src/tokens/index.js`
> **这是唯一真相来源**，`global.css :root` 中的 CSS 变量必须与本文件保持同步

```js
// src/tokens/index.js

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
  gray400: '#94A3B8',
  gray600: '#475569',
  gray700: '#334155',
  gray900: '#0F172A',

  // 功能色
  aiPurple:    '#7C3AED',
  aiPurpleBg:  'rgba(124,58,237,0.25)',
  success:     '#059669',
  error:       '#EF4444',
  warning:     '#D97706',
  orange:      '#EA580C',
  greenText:   '#16A34A',
};

export const gradients = {
  hero:    'linear-gradient(135deg, #0D1526 0%, #1B3A6B 55%, #1B5FEB 100%)',
  ai:      'linear-gradient(135deg, #1A0533 0%, #2D1B69 50%, #1B4FA8 100%)',
  cta:     'linear-gradient(90deg, #1B5FEB 0%, #0D3BB8 100%)',
  text:    'linear-gradient(135deg, #60A5FA, #A78BFA)',
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
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 },
  lineHeights: { tight: 1.2, heading: 1.25, card: 1.4, body: 1.6, loose: 1.75 },
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
    hover:    '150ms',
    card:     '300ms',
    reveal:   '700ms',
    hero:     '900ms',
    modal:    '350ms',
    carousel: '500ms',
    dropdown: '250ms',
    mobileMenu: '380ms',
  },
};

export const breakpoints = {
  tablet:  '768px',
  desktop: '1024px',
  wide:    '1280px',
};
```

---

> 📌 **PO 确认项**：
> 1. 色彩系统与原版完全继承，无新增色值，请确认是否需要调整
> 2. 响应式断点沿用原版规范（768 / 1024 / 1280），请确认
> 3. `design-tokens.js` 是唯一真相来源，后续所有颜色修改从此文件发起

*设计师 Agent 产出 | 2026-03-15*
