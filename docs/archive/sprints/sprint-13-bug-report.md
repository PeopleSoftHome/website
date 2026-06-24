# Sprint 13 Bug Report — v2.3.0 GA 用户验收缺陷

> **产出角色**：产品经理 Agent  
> **文档版本**：v1.0  
> **日期**：2026-03-16  
> **来源**：用户验收测试反馈（11 条）  
> **状态**：待修复

---

## 一、Bug 根因分类（5 类）

### 根因 A：`.reveal` class 缺少全局 IntersectionObserver【影响最广 · P0】

**受影响组件**：`ProductCard` / `AiCard` / `MetricCard` / `ResourceCard`  
**现象**：产品矩阵、AI Family、WhyUs 指标、资源中心全部白屏/空白

**原因**：
- `RevealWrapper` 组件内部用 `useScrollReveal` Hook 观察**自身元素**
- `ProductCard` / `AiCard` 等直接在自己的根元素加 `className="reveal"` 原始 class
- 没有任何观察者监听这些裸 `.reveal` 元素 → `is-visible` 永远不会被添加 → 这些卡片 `opacity:0` 永久不可见
- `RevealWrapper` 只能管到被其包裹的元素，管不到子孙组件自己加的 `reveal` class

**涉及 Bug**：#6 产品矩阵、#7 AI Family、#9b WhyUs 指标、#10 资源中心

---

### 根因 B：双重 suffix 渲染【P0】

**受影响组件**：`StatsSection.jsx`  
**现象**：`8000+` 显示为 `8000++`，`2000万+` 显示为 `2000万+万+`

**原因**：
```jsx
// useCountUp 已在 textContent 追加了 suffix（如 "8000+"）
const { ref } = useCountUp(target, { suffix });

// StatsSection 额外又渲染了一个 <span> 显示同一个 suffix
<span ref={ref}>0</span>           // → "8000+"（useCountUp 写入）
<span className={styles.suffix}>{suffix}</span>  // → "+"（多余！）
```

**涉及 Bug**：#5 统计数字双重 suffix

---

### 根因 C：NavDropdown 与触发区之间存在 8px 真空间隙【P0】

**受影响组件**：`NavDropdown.module.css`  
**现象**：鼠标从导航 label 移向下拉菜单时，经过 8px 间隙导致 hover 丢失，下拉消失

**原因**：
```css
/* NavDropdown.module.css */
.dropdown {
  top: calc(100% + 8px);  /* 8px 间隙！ */
}
/* .item 的 padding-bottom: 20px 创造了桥接区，但 dropdown 仍在桥接区下方 8px */
```
鼠标从 `.item` 底部到 `.dropdown` 顶部要穿越 8px 真空，hover 链路断开。

**涉及 Bug**：#1 二级菜单消失

---

### 根因 D：Hero Section 视觉设计问题【P1】

**受影响组件**：`HeroSection.module.css`  
**现象**：Hero 深蓝色背景与下方白色页面衔接突兀；Dashboard 卡片有 3D 透视斜角

**原因**：
- 背景仍使用 `var(--grad-hero)` = 深蓝渐变，用户期望浅色背景
- `.deviceFrame` 使用 `transform: perspective(900px) rotateY(-8deg) rotateX(3deg)` 导致卡片倾斜

**涉及 Bug**：#3 Hero 背景深色 + 卡片歪斜

---

### 根因 E：BrandScroll 动画缺失、AiCard 默认值错误、Chat 无功能【P1/P2】

| 子根因 | 组件 | 现象 | 原因 |
|--------|------|------|------|
| E1 | `BrandScrollSection.module.css` | 滚动动画不生效 | `@keyframes marquee` 在 `animations.css` 中是全局定义，但 CSS Modules 编译后 module 文件中的 `animation: marquee` 可能无法引用全局 keyframe，需在 module 内本地声明 |
| E2 | `AiCard.jsx` | 默认 linkText 显示 `{linkText}` 字符串 | 默认参数写成了模板字符串占位符字面量：`linkText = "{linkText}"` 应为 `linkText = "产品详情 →"` |
| E3 | `FloatingBar` / `SearchContext` | 在线咨询无动作；搜索体验差 | 在线咨询按钮无 onClick；搜索弹窗应改为 NavBar 内联展开 |

---

## 二、完整 Bug 清单

| # | 用户反馈 | 根因 | 优先级 | 影响范围 |
|---|---------|------|--------|---------|
| BUG-101 | AI Family、产品下拉菜单移到二级 div 会消失 | C：8px 间隙 | 🔴 P0 | 导航交互 |
| BUG-102 | 搜索框 ⌘K 看不懂，且弹窗体验差，希望内联展开 | E3 | 🟡 P1 | 搜索 UX |
| BUG-103 | Hero 深蓝背景突兀，Dashboard 卡片是斜的 | D | 🟡 P1 | 首屏视觉 |
| BUG-104 | 品牌滚动无动画 | E1 | 🔴 P0 | 品牌展示 |
| BUG-105 | Stats 数字后面有两个 + / 万+ | B：双重 suffix | 🔴 P0 | 数据展示 |
| BUG-106 | 产品矩阵点 Tab 下面没有内容 | A：reveal 无观察者 | 🔴 P0 | 核心功能 |
| BUG-107 | AI Family 区域空白 | A：reveal 无观察者 + E2 linkText | 🔴 P0 | 核心功能 |
| BUG-108 | 客户口碑需要滚动+hover 悬停效果 | A：reveal 可能影响 | 🟡 P1 | 交互体验 |
| BUG-109 | Logo 筛选后不对齐；WhyUs Tab 内容空 | A + Logo hidden 占位 | 🔴 P0 | 核心功能 |
| BUG-110 | 资源中心区域空白 | A：reveal 无观察者 | 🔴 P0 | 核心功能 |
| BUG-111 | 在线咨询打不开，chatbot 没了 | E3：无 onClick | 🟡 P1 | 转化入口 |

---

## 三、用户体验影响评估

| 影响等级 | 受影响页面区域 | 描述 |
|---------|-------------|------|
| **致命**（页面空白）| 产品矩阵、AI Family、WhyUs 指标区、资源中心 | 核心产品内容完全不可见，严重影响转化 |
| **严重**（数据错误）| Stats 统计栏 | 8000++、2000万+万+ 等数字错误显示 |
| **严重**（交互失效）| 导航下拉菜单 | 二级菜单无法正常使用 |
| **中等**（功能缺失）| 搜索、在线咨询 | 用户无法搜索产品，咨询入口失效 |
| **轻微**（视觉问题）| Hero、品牌滚动 | 视觉不一致，不影响核心功能 |

---

## 四、不属于 Bug 的澄清

| 用户描述 | 实际情况 | 处理方式 |
|---------|---------|---------|
| Hero「观看产品演示」无功能 | v1.2.0 原版也无 onclick，v2.3.0 已接入 VideoModal，属于**增强** | ✅ 已实现，无需修复 |
| 在线咨询是 chatbot | 原始 v1.2.0 也没有 chatbot，只是一个无动作按钮 | 作为新需求处理，BUG-111 改为打开联系方式弹窗 |

