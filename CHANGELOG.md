# Changelog

All notable changes to TalentPro HR Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.1] — 2026-03-16 ✅ Hotfix 正式版

### Sprint 13 — 验收缺陷修复（11条）

#### P0 — 致命（页面内容不可见、数据错误、交互失效）

**BUG-101 修复** · 导航下拉菜单移向二级内容时消失
- `NavDropdown.module.css`：追加 `::before` 透明桥接伪元素（height: 10px），覆盖 `.item` 与 `.dropdown` 之间的 8px 真空间隙

**BUG-104 修复** · 品牌 Logo 滚动动画不生效
- `BrandScrollSection.module.css`：在模块内本地声明 `@keyframes marquee`（CSS Modules 无法引用跨文件全局 keyframe）

**BUG-105 修复** · Stats 统计数字双重后缀（8000++、2000万+万+）
- `StatsSection.jsx`：删除多余的 `<span>{suffix}</span>`，`useCountUp` 已在 `textContent` 中追加 suffix

**BUG-106/107/109b/110 修复** · 产品矩阵、AI Family、WhyUs 指标、资源中心区域白屏
- `App.jsx`：新增全局 `IntersectionObserver` + `MutationObserver`，扫描所有裸 `.reveal` 元素并添加 `is-visible`（Tab 切换后 50ms 防抖重扫）

**BUG-107 修复** · AiCard 显示字符串 `{linkText}` 而非实际文字
- `AiCard.jsx`：默认参数从 `"{linkText}"` 修正为 `"产品详情 →"`

**BUG-109a 修复** · Logo 墙筛选后 grid 错位
- `LogoWallSection.module.css`：`.hidden` 从 `opacity:0` 改为 `visibility:hidden`，保持 grid 占位不影响对齐

#### P1 — 体验（视觉、交互、功能入口）

**BUG-102 修复** · 搜索 ⌘K 提示看不懂，弹窗体验差
- `NavBar.jsx` + `NavBar.module.css`：搜索改为 NavBar 右侧内联展开（宽度动画 0→200px），placeholder 说明用途，Enter 触发完整搜索弹窗

**BUG-103 修复** · Hero 深蓝背景与下方白色衔接突兀 + Dashboard 卡片倾斜
- `HeroSection.module.css`：背景改为浅蓝渐变（`#F0F6FF → #EBF1FF → #F5F0FF`），文字由白改深色
- 移除 `perspective/rotateY/rotateX` 3D 透视倾斜，改为 hover 上移效果（`translateY(-6px)`）
- `HeroSection.jsx`：移除 `bgGrid` 网格背景层

**BUG-108 修复** · 客户口碑轮播缺少 hover 悬停视觉反馈
- `TestimonialSection.module.css`：`.carouselWrap` 添加 `cursor: grab` / `:active { cursor: grabbing }`

**BUG-111 修复** · 在线咨询无功能，需实现 Chatbot
- 新增 `src/components/ui/ChatBot/` 目录（3个文件）
  - `chatData.js`：14 条 FAQ 规则知识库（招聘/薪酬/考勤/AI/行业/价格/安全/演示）+ 欢迎语 + 兜底回复
  - `ChatBot.jsx`：完整聊天窗口（气泡消息、打字指示器、快捷回复、关键词匹配、人工接入申请、Enter 发送）
  - `ChatBot.module.css`：右下角固定浮窗（不遮罩），暗色模式 + 移动端全屏
- `FloatingBar.jsx`：💬 在线咨询 → ChatBot；📞 电话 → ContactModal（职责分离）
- `App.jsx`：挂载 `<ChatBot>`，传入 `onOpenDemo` 回调（可从 bot 直接触发预约演示弹窗）

#### 其他改进（v2.3.1 补丁）

**NavBar 初始可见性修复**（随 BUG-103 Hero 浅色化联动）
- `NavBar.module.css`：初始态从 `background: transparent` 改为 `rgba(255,255,255,0.88)` 毛玻璃
- 所有导航文字/图标从「白色透明」改为深色（`var(--gray-700)`），打开页面即完全可见
- 新增 `.dark` 初始态深色规则，覆盖暗色模式下的白色背景

---

## [2.3.0] — 2026-03-15 ✅ v2.3.0 完整发布

### Sprint 12 — 全局搜索（Cmd+K）

**新增文件（5个）**
- `src/data/searchIndex.js`：50 条完整搜索索引（20 产品 / 5 行业 / 6 资源 / 12 功能特色 / 7 通用）
- `src/hooks/useSearch.js`：前端全文检索（加权评分）+ 150ms 防抖 + ↑↓ 键盘导航 + 关键词高亮
- `src/context/SearchContext.js`：全局搜索开关 Context，内含 Cmd+K / Ctrl+K 全局监听
- `src/components/ui/SearchModal/SearchModal.jsx`：完整搜索弹窗（热门搜索 / 分类结果 / 无结果态 / 底部快捷键提示）
- `src/components/ui/SearchModal/SearchModal.module.css`：完整样式含暗色模式

**修改文件（3个）**
- `App.jsx`：接入 `SearchProvider` + 挂载 `<SearchModal />`
- `NavBar.jsx`：新增搜索按钮（🔍 图标 + ⌘K 提示），接入 `openSearch()`
- `NavBar.module.css`：追加 `.searchBtn` / `.searchShortcut` 样式

---

## [2.3.0-sprint11] — 2026-03-15

### Added — 多语言 + 暗色模式（Sprint 11a + 11b）

**Sprint 11a — i18n 架构 + 暗色 Token（基础设施）**
- 新建 `src/i18n/` 完整目录体系
  - `interpolate.js`：`{var}` 字符串插值函数
  - `index.js`：`I18nProvider` + `useI18n()` Hook，语言检测（localStorage → navigator → 兜底 zh）
  - `locales/zh-CN.json`：全量简体中文（355 个 key，17 个顶层模块）
  - `locales/en.json`：全量英文翻译（355 个 key，完全对齐）
  - `locales/zh-TW.json`：全量繁体中文（355 个 key，完全对齐）
- 新建 `src/hooks/useTheme.js`：亮/暗切换，localStorage 持久化，跟随系统 prefers-color-scheme
- 新建 `src/context/ThemeContext.js`
- 更新 `global.css`：追加 `[data-theme="dark"]` CSS Token 覆盖层（~60 行，语义化变量）

**Sprint 11b — 组件全量接入（业务层）**
- 新建 `src/i18n/keyMap.js`：产品/Tab/AI卡/行业 ID → i18n key 映射表
- `App.jsx`：接入 `I18nProvider` + `ThemeContext.Provider`（Provider 四层嵌套）
- NavBar：新增语言切换器（简中/English/繁中下拉）+ 主题切换按钮（☀️/🌙），含暗色适配
- 全量 15 个 Section 组件接入 `useI18n()` / `t()` 函数，消除所有硬编码中文
- DemoModal 3 步骤：表单标签、错误提示、验证码倒计时 `{n}s` 插值全部国际化
- 各 Section `.module.css` 追加 `[data-theme="dark"]` 暗色样式规则

---
## [2.2.0] — 2026-03-15 🎉 GA 正式版

### Added

**Sprint 9 — OPT-03 + ENH-02**
- Logo 墙（SEC-09）18 个客户 Logo 升级为「品牌色首字母圆形」图形化方案
  - 默认灰度（`filter: grayscale(1) opacity(0.65)`），视觉统一低调
  - hover 还原品牌彩色（`filter: none`），0.3s 过渡，圆形边框加深
  - `color-mix()` 自动计算品牌色透明度，附旧版浏览器 `@supports` fallback
- 「为什么选我们」（SEC-10）底部新增安全认证徽章区（ENH-02）
  - 6 个徽章：等保三级 / ISO 27001 / SOC 2 / 银行级加密 / 国密算法 / 九层防护
  - hover 轻微背景变化；Mobile 端隐藏描述文字，仅显示图标 + 标签

**Sprint 10 — OPT-06**
- Hero 副 CTA「▶ 观看产品演示」接入视频弹窗（VideoModal）
  - 黑色毛玻璃遮罩，`z-index: 3000`（高于 DemoModal 的 2000）
  - 16:9 比例 iframe 容器，scale + opacity 入场动画（300ms）
  - 关闭时重置 iframe src，强制停止视频/音频（跨浏览器兼容）
  - 关闭按钮 hover 旋转 90°；支持点击遮罩 / ESC 关闭
  - 独立 `VideoModalContext` + `useVideoModal` Hook，与 DemoModal 完全解耦

### Changed
- `src/styles/global.css`：新增 `body.video-modal-open` 滚动锁定 class

---

## [2.1.0] — 2026-03-15

### Added

**Sprint 7 — OPT-01 + ENH-03**
- 新建 `src/components/ui/ProductIcons/` — 20 个内联 SVG 图标组件
  - HR SaaS（蓝 #1B5FEB）：招聘/绩效/组织/假勤/薪酬/学习/盘点/分析
  - AI Family（紫 #7C3AED）：AI招聘/AI面试/AI教练/AI做课
  - 人才测评（橙 #EA580C）：测评/360/考试/人才模型
  - PaaS（绿 #059669）：低代码/API/生态广场/安全合规
- 产品矩阵（SEC-05）、AI Family 专区（SEC-06）所有卡片图标替换为 SVG
- 资源中心（SEC-11）从 3 条扩展至 6 条
  - 新增：《2026 企业校园招聘 AI 应用实用指南》（白皮书）
  - 新增：《HR 数字化升级全景指南》（报告，新增天蓝 Tag 类型）
  - 新增：人才选用育留一体化直播视频（新增紫色 video Tag 类型）

**Sprint 8 — ENH-04 + TASK-135**
- Footer（SEC-13）品牌列新增二维码占位区（官方公众号 + 视频号，SVG 点阵）
- Footer 新增社交图标行（知乎 + 微博 SVG，hover 变主色蓝）
- HeroSection（SEC-02）新增 3 个浮动装饰几何圆（移动端自动隐藏）
- Hero Dashboard 外发光增强（双层 drop-shadow，视觉层次更丰富）
- Hero 信任点新增竖线分隔符（::before 伪元素，padding 间距优化）

---

## [2.0.0] — 2026-03-15

### Added — React 重构基线版本（功能完全对等 v1.2.0）

**Sprint 1 — 工程基础**
- Vite 5 + React 18 工程初始化
- Design Token 体系（`src/tokens/index.js` → `global.css`）
- NavBar 组件（含 Mega 下拉菜单 + 推广 Banner）
- Footer 组件（4 列布局 + 热门 Tag + 版权行）

**Sprint 2 — 首屏区域**
- HeroSection（深色渐变 + Dashboard 浮动截图 + 渐变动效）
- BrandScrollSection（CSS Marquee 无限滚动 + 两侧淡出遮罩）
- StatsSection（6项 count-up 动画）
- `useCountUp` / `useScrollReveal` Hooks

**Sprint 3 — 产品展示**
- ProductMatrixSection（4 Tab × 产品卡片网格）
- AiFamilySection（深色渐变 + 玻璃态卡片 + HOT 徽章 + 跨列 Banner）
- `useTabs` Hook + `TabNav` 通用组件（3 种样式变体）

**Sprint 4 — 行业与口碑**
- IndustrySolutionSection（5 行业 Tab + 左右分栏 + 5 种截图类型）
- TestimonialSection（3列轮播 + 导航圆点）
- `useCarousel` Hook

**Sprint 5 — 信任建立**
- LogoWallSection（18 个 Logo + 行业筛选 + opacity/scale 动画）
- WhyUsSection（深色背景 + 3 Tab + 底部统计数字条 count-up）

**Sprint 6 — 转化触达**
- ResourceSection（3 张卡片 + 封面渐变 + 类型 Tag）
- CtaBannerSection（蓝色渐变通栏 + 光晕装饰）
- FloatingBar（桌面右侧竖排 / 移动端底部横排）
- DemoModal（3步骤完整弹窗：联系信息 + 产品选择 + 企业规模 + 成功态）

### Fixed
- **BUG-01**：移动端 Hamburger 菜单无展开功能（MobileMenu.jsx 从右侧滑入 + accordion）
- **BUG-02**：轮播 resize 后 transform 偏移（`useCarousel` Hook resize 防抖重算）
- **BUG-03**：证言轮播悬停未暂停（`bindPauseEvents` mouseenter/leave 绑定）

### Changed（相对 v1.2.0 架构升级）
- 从单文件 HTML（1918行）迁移至 React 组件体系（83个文件，51个组件）
- 数据与视图完全解耦（9个纯 JS 数据文件）
- 截图卡内容大幅提升：央国企→竞聘时间轴 / 金融→九宫格人才盘点（OPT-02 提前完成）

---

## 旧版本记录（单文件 HTML 时代）

## [1.2.0] — 2026-03-14

### Added
- TASK-1.2.1：Logo 墙行业筛选功能（data-industry 属性 + 过渡动画）
- TASK-1.2.4：导航下拉菜单底部推广 Banner
- TASK-1.2.5：验证码倒计时功能（60s 倒计时 + 禁用状态）

### Fixed
- TASK-1.2.2：预约弹窗 Step1 表单验证（姓名/公司/手机号/验证码）
- TASK-1.2.3：移动端浮动栏改为底部固定横排（< 768px）

---

## [1.1.0] — 2026-03-12

### Fixed
- BUG-01：移动端 Hamburger 菜单点击展开（含二级菜单 accordion）
- BUG-02：证言轮播 resize 后 transform 偏移问题（防抖重计算）
- BUG-03：证言轮播悬停暂停自动播放

### Changed
- TASK-1.1.4：导航 scrolled 态优化（毛玻璃 + Logo 清晰度提升）

---

## [1.0.0] — 2026-03-12

### Added
- 完成首页全部 15 个 Section 基础实现
- 实现滚动入场动画（reveal + IntersectionObserver）
- 实现 count-up 数字动画
- 实现产品矩阵 4 Tab 切换
- 实现行业方案 5 Tab 切换
- 实现「为什么选我们」3 Tab 切换
- 实现客户证言 3 列自动轮播
- 实现预约演示 3 步骤弹窗（多步表单 + 成功态）
- 实现导航栏滚动变色（透明 → 白色）
- 实现浮动操作栏（4 个快捷入口）
- 完成响应式布局基础适配（4 断点）
