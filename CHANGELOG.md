# Changelog

All notable changes to TalentPro HR Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] — 2026-05-26 ✅ 社交互动迭代

### Added — 个人主页 + 评论系统 + @提及

**Sprint 19 — 用户互动与社交**
- **个人主页**
  - `ProfilePage.vue`：用户资料展示（头像、昵称、邮箱、bio、加入时间）
  - 资料编辑表单（昵称、bio、头像链接），调用 `PATCH /auth/profile`
  - `NavBar` 头像下拉点击「个人中心」跳转 `/profile`
- **评论系统**
  - `CommentSection.vue` + `CommentItem.vue`：通用评论列表组件，支持嵌套回复展示
  - `CommentForm.vue`：评论/回复表单，支持 `@提及` 自动补全（↑↓ 选择、Enter 确认、Esc 关闭）
  - `Avatar.vue`：通用头像组件（替代 Element Plus `el-avatar`）
  - 博客详情页集成评论：`BlogDetailView.vue` 底部接入 `CommentSection`
  - 论坛话题页集成回复：`ForumTopicView.vue` 支持发表新回复（调用 `POST /forums/posts`）
- **@提及功能**
  - 评论/回复输入框输入 `@` 触发用户搜索自动补全（`GET /users/search?q=`）
  - 评论内容渲染时高亮 `@用户名`（蓝色 + 粗体）
- **后端 API 补充**
  - Prisma：`User` 模型新增 `bio` 字段
  - `PATCH /auth/profile`：用户自助更新资料（name/avatar/phone/bio）
  - `GET /users/search?q=`：公开用户搜索（用于 @mention autocomplete）
- **i18n**：新增 `comment.*` 和 `profile.*` 多语言 key（中/英/繁）

### Fixed
- `BlogDetailView.vue` / `ForumTopicView.vue`：移除 Element Plus `el-icon`、`el-skeleton`、`el-avatar`，改用项目自研组件
- `talentpro-admin/src/router/index.js`：修复重复的 `blogs` / `forums` 路由

---

## [2.6.0] — 2026-05-26 ✅ 内容生态迭代

### Added — 博客/论坛 + Admin 后台 + 用户认证

**Sprint 18 — 内容生态与管理后台**
- **博客系统**
  - 前端：`BlogListView.vue`（分类筛选 + 分页）、`BlogDetailView.vue`（Markdown 渲染 + 面包屑）
  - 后端：NestJS Blog 模块，完整 CRUD + 分类/标签管理 + 权限控制（`ADMIN`/`SUPER_ADMIN`）
  - Admin：`BlogManagerView.vue` — 文章列表、新建/编辑弹窗、状态管理、分页、删除
- **论坛系统**
  - 前端：`ForumView.vue`（话题列表 + 分类 Tab）、`ForumTopicView.vue`（楼层回复 + 发帖）
  - 后端：NestJS Forum 模块，完整 CRUD + 置顶/锁定 + 权限控制
  - Admin：`ForumManagerView.vue` — 话题列表、置顶/锁定开关、删除、分页
- **Admin Dashboard**
  - `talentpro-admin/`：Vue 3 + Vite + Element Plus + Pinia + Vue Router
  - 登录页（`LoginView.vue`）+ 布局骨架（`LayoutView.vue`）+ 路由守卫
  - 仪表盘（`DashboardView.vue`）：概览卡片 + 线索趋势 + 最近线索
  - 用户管理（`UsersView.vue`）+ 线索管理（`LeadsView.vue`）+ 内容管理（`ContentsView.vue`）
  - **数据分析（`AnalyticsView.vue`）**：总页面浏览量/事件数/独立会话概览、转化漏斗（`el-progress`）、每日趋势 CSS 条形图、热门页面/事件 TOP10
- **前端用户认证**
  - `src/stores/auth.js`：Pinia-style auth store（login/register/fetchProfile/logout/refreshToken）
  - `AuthModal.vue`：登录/注册双模式弹窗、表单验证、错误提示、模式切换
  - `NavBar.vue`：未登录显示「登录」按钮 → 打开弹窗；已登录显示用户头像/名称下拉菜单（个人中心/退出）
  - `MobileMenu.vue`：移动端同样支持登录状态展示 + 退出登录
  - i18n key：`auth.*` 多语言（中/英/繁）

**Sprint 17 — Vue 3 迁移 + 后端基础**
- **前端框架迁移：React 18 → Vue 3.5**
  - 全部 `.jsx` 组件重写为 `.vue`（SFC + `<script setup>`）
  - Context → Vue `provide/inject`
  - React Hooks → Vue Composables（`ref`/`computed`/`watch`/`onMounted`）
  - 状态管理：自定义 store 模式（`createI18n`/`createTheme`/`createModal` 等工厂函数）
- **Vue Router 集成**
  - 首页 `/`、博客 `/blog`、博客详情 `/blog/:slug`、论坛 `/forum`、话题详情 `/forum/topic/:id`
  - `router-view` 挂载于 `App.vue`
- **后端 API（NestJS 11 + Prisma 6 + PostgreSQL 16 + Redis 7）**
  - Blog/Forum/Analytics 模块完整 CRUD
  - Auth 模块：注册/登录/JWT/刷新令牌/权限守卫（`RolesGuard`）
  - 线索模块：演示预约表单提交 + 列表查询
  - Meilisearch 全文搜索、MinIO 对象存储（预留）
- **字体子集化**
  - Python + fonttools 提取 1379 个字符，pyftsubset 生成 5 字重 woff2
  - Noto Sans SC 从 55MB 降至 ~1MB，woff2 本地托管

### Changed
- `AGENTS.md`：技术栈更新为 Vue 3.5 + Vite 5 + Vue Router
- `docs/architecture.md`：全面更新为 Vue 3 组件树 + 新增后端架构 + Admin 架构

---

## [2.5.0] — 2026-05-26 ✅ 性能与分发批次

### Added — 数据埋点 + 动态 SEO + ROI 计算器

**Sprint 16 — 转化与洞察**
- **ROI 计算器**（新增 Section SEC-16）
  - `useRoiCalculator.js`：5 参数模型（员工数/月招聘/招聘周期/HR人数/HR月薪）
  - 输出：年度节省、ROI 率、投资回收期 + 成本对比柱状图
  - `AnimatedNumber.vue`：ease-out cubic 数字过渡动画
  - 位于资源中心下方、CTA Banner 上方
- **A/B 测试框架**
  - `useABTest.js`：确定性哈希分桶，visitor ID 持久化，force()/clearAll() QA 工具
- **Cookie 同意横幅 + 偏好中心**
  - `useCookieConsent.js`：3 级 Cookie（必要/分析/营销），localStorage 持久化
  - `CookieBanner.vue`：底部横幅 + 展开偏好中心，glass morphism 样式
- **DemoModal 表单增强**
  - 手机号自动格式化（`138 0000 0000`）
  - 输入聚焦自动滚动（防键盘遮挡）
  - 步骤进度文字（"第 1 步 / 共 3 步"）
  - 服务条款勾选框 + 验证
  - 成功页显示预约摘要（姓名/公司/产品/规模）
- **智能产品推荐**
  - DemoModal Step2：根据已选产品推荐关联产品 Chips（如「招聘管理」→「人才测评」「AI Family」）

**Sprint 15 — 数据驱动**
- **埋点分析系统**（ANA-01）
  - `useAnalytics.js`：检查 Cookie 同意，写入 `window.tp_analytics` 队列
  - 14+ 核心事件：`page_view`、`section_visible`、`demo_modal_open`、`demo_step_complete`、
    `demo_submit`、`product_tab_click`、`industry_tab_click`、`search_query`、`search_click`、
    `video_play`、`resource_download`、`roi_interact`、`lang_switch`、`theme_switch`
- **动态 SEO**
  - `syncDocumentMeta`：语言切换时同步更新 `document.title`、`meta description`、`<html lang>`、hreflang 链接

### Changed
- `HomePage.vue`：新增 `RoiCalculatorSection` 挂载
- `App.vue`：接入 `AnalyticsProvider`，新增全局埋点监听（watch 语言/主题/弹窗/视频/搜索）

---

## [2.4.0] — 2026-05-15 ✅ 转化提升批次（Sprint 13-14）

> 本版本实际与 v2.5.0 同期开发并合并发布。

---

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
