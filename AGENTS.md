# AGENTS.md — TalentPro HR Portal

> 本文件面向 AI 编程助手。如果你在阅读本文件，说明你即将参与 TalentPro HR Portal 项目的开发或维护。
> **当前版本**：v2.6.0 | **技术栈**：Vue 3.5 + Vite 5 + CSS Modules + Vue Router + NestJS 11 + Prisma 6

---

## 1. 项目概览

TalentPro HR Portal 是面向中大型企业的一体化 HR SaaS 平台官方营销门户。它是一个单页静态应用（SPA），以「预约演示」为核心转化目标，由 15 个页面 Section 组成。

- **产品定位**：B2B 企业级营销门户（Marketing Portal）
- **核心页面**：Hero → 品牌滚动 → 统计 → 产品矩阵 → AI Family → 行业方案 → 客户证言 → Logo 墙 → 为什么选我们 → 资源中心 → CTA 通栏 → 页脚
- **数据策略**：营销门户纯静态 JS 常量（`src/data/`）；博客/论坛接入后端 NestJS API（`src/api/`）
- **部署形态**：静态站点（`dist/` 目录直推 CDN / Nginx / Vercel）

---

## 2. 技术栈与构建

### 2.1 核心依赖

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Vue | 3.5.0 | SFC + `<script setup>`，组合式 API |
| 构建工具 | Vite | 5.4.2 | 开发端口 3000 |
| 插件 | @vitejs/plugin-vue | 5.1.0 | 含 Fast Refresh |
| 路由 | Vue Router | 4.4.0 | 博客/论坛多页面路由 |
| 样式 | CSS Modules | 原生 | 零运行时开销 |
| 语言 | JavaScript | ES Module | 无 TypeScript（后续可渐进迁移） |

**不引入 UI 组件库**（antd / MUI 等）。所有原子组件自行封装，原因：品牌视觉高度定制（渐变、玻璃态、AI 专区深色），通用库无法复用；且会显著增加包体积。

### 2.2 构建与运行命令

```bash
# 安装依赖
npm install

# 开发服务器（http://localhost:3000）
npm run dev

# 生产构建 → dist/ 目录
npm run build

# 预览生产构建
npm run preview
```

**环境要求**：Node.js ≥ 18，npm ≥ 9。

### 2.3 构建配置（`vite.config.js`）

- `outDir: 'dist'`
- `manualChunks: { vendor: ['vue', 'vue-router'] }` — Vue 单独拆包
- 无额外插件、无路径别名（import 使用相对路径）

---

## 3. 目录结构与模块划分

```
talentpro-v2/
├── index.html                    # 入口 HTML（加载 Noto Sans SC 字体）
├── package.json
├── vite.config.js
├── public/                       # 静态资源（favicon 等）
└── src/
    ├── main.js                   # createApp + router 挂载
    ├── App.vue                   # 根组件：5 层 Provider + router-view + 全局观察器
    ├── router/
    │   └── index.js              # Vue Router：Home / Blog / BlogDetail / Forum / Topic
    ├── pages/
    │   ├── HomePage.vue          # 组装全部 15 个 Section
    │   ├── BlogListView.vue      # 博客列表
    │   ├── BlogDetailView.vue    # 博客详情
    │   ├── ForumView.vue         # 论坛话题列表
    │   └── ForumTopicView.vue    # 话题详情
    │
    ├── components/
    │   ├── layout/               # 全局布局
    │   │   ├── NavBar/           # 导航（含 MobileMenu、NavDropdown）
    │   │   └── Footer/           # 页脚
    │   ├── sections/             # 15 个页面区块（每个目录含 .vue + .module.css）
    │   │   ├── HeroSection/
    │   │   ├── ProductMatrixSection/
    │   │   ├── AiFamilySection/
    │   │   ├── IndustrySolutionSection/
    │   │   ├── TestimonialSection/
    │   │   ├── WhyUsSection/
    │   │   └── ...
    │   └── ui/                   # 通用原子组件
    │       ├── Button/
    │       ├── Tag/
    │       ├── SectionHeader/
    │       ├── TabNav/
    │       ├── DemoModal/        # 预约演示 3 步骤弹窗
    │       ├── VideoModal/       # 产品演示视频弹窗
    │       ├── SearchModal/      # Cmd+K 全局搜索
    │       ├── ContactModal/     # 联系方式卡片
    │       └── ChatBot/          # 智能客服（v2.3.1）
    │
    ├── stores/                   # 全局状态（7 个工厂函数）
    │   ├── i18n.js               # I18nProvider + useI18n
    │   ├── theme.js              # 暗色模式
    │   ├── modal.js              # 预约弹窗状态
    │   ├── videoModal.js         # 视频弹窗状态
    │   ├── search.js             # 全局搜索开关
    │   ├── analytics.js          # 埋点队列
    │   └── auth.js               # 用户认证（login/register/logout）
    │
    ├── api/                      # 后端 API 封装
    │   ├── client.js             # Axios 实例（含 token 拦截器）
    │   ├── blog.js               # 博客 API
    │   └── forum.js              # 论坛 API
    │
    ├── composables/              # 自定义 Composables（9 个）
    │   ├── useModal.js           # 弹窗状态机（含 ESC + body overflow）
    │   ├── useVideoModal.js
    │   ├── useTheme.jsx          # 主题切换（localStorage + prefers-color-scheme）
    │   ├── useSearch.jsx         # 搜索算法 + 防抖 + 键盘导航
    │   ├── useCarousel.js        # 轮播（resize 修复 + 悬停暂停）
    │   ├── useCountUp.js         # 数字递增动画（IntersectionObserver 驱动）
    │   ├── useNavScroll.js       # 导航滚动状态
    │   ├── useScrollReveal.js    # 单元素滚动入场
    │   └── useTabs.js            # Tab 切换
    │
    ├── data/                     # 静态业务数据（11 个纯 JS 文件）
    │   ├── navigation.js         # NAV_LINKS
    │   ├── products.js           # PRODUCT_TABS（4 Tab × 20 产品）
    │   ├── aiFamily.js           # AI_CARDS
    │   ├── industries.js         # INDUSTRY_TABS（5 Tab）
    │   ├── testimonials.js       # TESTIMONIALS
    │   ├── logos.js              # LOGO_ITEMS + LOGO_FILTERS
    │   ├── whyUs.js              # WHY_US_TABS + STATS_BAR
    │   ├── resources.js          # RESOURCES
    │   ├── stats.js              # STATS_DATA
    │   ├── security.js           # 安全认证数据
    │   └── searchIndex.js        # 50 条搜索索引
    │
    ├── i18n/                     # 多语言系统（v2.3.0）
    │   ├── index.jsx             # I18nProvider + useI18n composable
    │   ├── interpolate.js        # {var} 插值
    │   ├── keyMap.js             # ID → i18n key 映射
    │   └── locales/
    │       ├── zh-CN.json        # 355 keys
    │       ├── en.json
    │       └── zh-TW.json
    │
    ├── tokens/
    │   └── index.js              # Design Token JS 常量（唯一真相来源）
    │
    └── styles/
        ├── global.css            # :root CSS 变量 + Reset + body + 暗色覆盖
        ├── animations.css        # @keyframes（fadeUp / float / gradShift / marquee / pulse）
        └── reveal.css            # .reveal / .is-visible / .reveal-delay-N
```

---

## 4. 编码规范与风格指南

### 4.1 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| Section 组件 | `[名称]Section` | `HeroSection`, `ProductMatrixSection` |
| 子组件 | 语义名称 | `ProductCard`, `TestimonialCard` |
| UI 原子 | 功能名 | `Button`, `Tag`, `SectionHeader` |
| Composable | `use[功能名]` | `useCarousel`, `useCountUp` |
| Store | `[名称]Store` | `auth`, `theme` |
| 数据常量 | 全大写 SNAKE_CASE | `PRODUCT_TABS`, `STATS_DATA` |
| CSS class | camelCase | `.heroSection`, `.heroTitle` |

### 4.2 单文件行数限制

| 类型 | 上限 | 超出策略 |
|------|------|---------|
| Section 组件 | 150 行 | 拆子组件 |
| 子组件 | 80 行 | 提取 Composable |
| UI 原子组件 | 60 行 | 无需拆分 |
| CSS Module | 200 行 | 拆分 `@media` 块 |
| Hook | 100 行 | 拆分职责 |

### 4.3 样式规范（重要）

**CSS Modules 唯一合法方案**：

- 每个组件/section 目录内包含同名 `.module.css` 文件
- **禁止在 `*.module.css` 中硬编码色值**，必须使用 `var(--token)` 引用 CSS 变量
- 响应式写在同一文件底部，使用 `max-width` 断点

**全局样式职责分离**：

| 文件 | 职责 | 不应包含 |
|------|------|---------|
| `global.css` | `:root` CSS 变量 + Reset + body/a/img | 组件私有样式 |
| `animations.css` | 全部 `@keyframes` 定义 | 具体 class |
| `reveal.css` | `.reveal` / `.is-visible` / `.reveal-delay-N` | 其他样式 |

**CSS 变量同步规则**：`src/tokens/index.js` 是 Design Token 的「唯一真相来源」，任何颜色修改必须从此文件发起，并手动同步到 `global.css` 的 `:root`。

### 4.4 弹窗 z-index 层级（硬性规定，不可冲突）

| 弹窗 | z-index | 触发方式 |
|------|---------|---------|
| ChatBot（智能客服）| 1500 | 浮动栏 💬 按钮（右下角浮窗，不遮罩）|
| DemoModal（预约演示）| 2000 | NavBar「预约演示」/ 各 CTA 按钮 |
| AuthModal（登录/注册）| 2000 | NavBar「登录」按钮 |
| ContactModal（联系方式）| 2100 | 浮动栏 📞 按钮 |
| SearchModal（搜索）| 2500 | Cmd+K / NavBar 搜索图标 |
| VideoModal（视频演示）| 3000 | Hero「观看产品演示」按钮 |

### 4.5 Provider 层级（由外到内）

```
I18nProvider       → 多语言（zh / en / zh-TW）
  ThemeProvider    → 亮色 / 暗色主题
    SearchProvider → 全局搜索（Cmd+K）
      ModalContext → DemoModal（z-index 2000）
        VideoModalContext → VideoModal（z-index 3000）
          AuthProvider   → 用户认证（login/register/logout）
```

---

## 5. 核心架构模式

### 5.1 滚动入场动画（Reveal）

`App.vue` 挂载了**全局** `IntersectionObserver`（threshold: 0.06），扫描所有 `.reveal:not(.is-visible)` 元素并在进入视口后添加 `.is-visible`。

同时有一个 `MutationObserver` 监听 DOM 变化（如 Tab 切换重渲染新卡片），50ms 防抖后重新扫描。

**因此**：
- 如果组件自己用 `useScrollReveal` Composable，仍然可用
- 如果组件直接给根元素加 `class="reveal"`，全局观察者会自动驱动
- 不要同时用两种方式，避免重复观察

### 5.2 暗色模式（v2.3.0）

通过 `<html data-theme="dark">` 全局切换。`global.css` 中 `[data-theme="dark"]` 覆盖全部 Token。

- 优先级：localStorage (`tp-theme`) → `prefers-color-scheme` → `light`
- Composable：`useTheme()` 提供 `{ theme, toggle, setTheme, isDark }`

### 5.3 多语言 i18n（v2.3.0）

- 3 种语言：简体中文 (`zh`)、English (`en`)、繁體中文 (`zh-TW`)
- 355 个 key，按点分隔路径访问，如 `t('nav.demo')`
- 支持 `{var}` 插值：`t('stats.customers', { n: 6000 })`
- 优先级：localStorage (`tp-locale`) → 浏览器语言 → `zh`
- 切换时同步更新 `<html lang>`

### 5.4 全局搜索（v2.3.0）

- `Cmd+K` / `Ctrl+K` 全局触发
- 前端本地检索 `src/data/searchIndex.js`（50 条索引）
- 加权评分：标题命中 > tags 命中 > 描述命中
- 150ms 防抖，↑↓ 键盘导航，Enter 跳转，关键词高亮

---

## 6. 测试策略

### 6.1 测试现状

本项目**无自动化测试套件**（无 Jest、Vitest、Cypress、Playwright）。测试依赖**手动验证**。

### 6.2 手动验证清单（每次变更后必须执行）

**P0 — 核心流程**：
1. `npm run dev` 正常启动，控制台无报错
2. `npm run build` 构建成功，无 warning
3. 首页 15 个 Section 全部可见，无白屏
4. 导航下拉菜单：鼠标从一级移向二级时**不消失**
5. 产品矩阵 / 行业方案 / 为什么选我们：Tab 切换正常，内容联动
6. 客户证言轮播：自动播放、左右切换、hover 暂停、resize 不跳位
7. Logo 墙：行业筛选后 grid 不错位
8. 预约演示弹窗：3 步骤流程、表单填写、成功态、ESC 关闭
9. 全局搜索：Cmd+K 触发、输入关键词、↑↓ 导航、Enter 跳转、Esc 关闭
10. 暗色模式：切换后所有 Section 颜色正常，无硬编码未覆盖色值
11. 多语言：切换语言后所有文本正常，无遗漏 key
12. **博客/论坛**：路由跳转正常，列表加载、详情渲染、分页/筛选正常
13. **用户认证**：登录/注册弹窗、表单验证、登录后头像下拉、退出登录正常

**响应式**：
- Mobile (375px)：Hamburger 菜单、底部浮动栏横排、Hero 无 Dashboard 图
- Tablet (768px)：布局适配、无横向滚动
- Desktop (1024px+)：完整导航、所有特效正常

### 6.3 缺陷报告模板

```markdown
## Bug Report

**ID**：BUG-XXX
**发现版本**：vX.X.X
**严重程度**：P0 / P1 / P2
**复现概率**：必现 / 偶现
**复现步骤**：
1.
2.
**预期结果**：
**实际结果**：
**截图/录屏**：
```

---

## 7. 安全与性能

### 7.1 安全

- **后端已就绪**：NestJS + Prisma + PostgreSQL，API Base `http://localhost:4000/api/v1`
- 营销门户仍为纯前端静态站点，但博客/论坛/认证已接入真实后端 API
- 用户认证：JWT Access/Refresh Token，bcrypt 哈希，角色权限控制（`USER`/`ADMIN`/`SUPER_ADMIN`）
- 表单验证：前端 + 后端双重校验，手机号格式校验，HTTPS 强制（生产环境）
-  Admin 后台：`talentpro-admin/`，端口 3457，独立部署

### 7.2 性能目标

| 指标 | 目标 | 工具 |
|------|------|------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| JS Bundle（vendor）| < 150KB gzip | Vite 构建报告 |
| JS Bundle（app）| < 80KB gzip | Vite 构建报告 |
| CSS Bundle | < 30KB gzip | Vite 构建报告 |

**已做的优化**：
- Vue / Vue Router 拆分为独立 vendor chunk
- 所有图片使用 `max-width: 100%` + 懒加载占位
- IntersectionObserver 驱动动画，不监听 scroll 事件
- `prefers-reduced-motion: reduce` 禁用所有动效

---

## 8. 部署

```bash
npm run build
```

产物输出到 `dist/` 目录，可直接部署到：
- Vercel / Netlify（拖拽上传或 Git 集成）
- Nginx（`location / { try_files $uri $uri/ /index.html; }`）
- OSS + CDN（阿里云、腾讯云等）

**注意**：本项目是 Vue Router SPA，需配置 `try_files $uri $uri/ /index.html;` 以支持前端路由（`/blog`、`/forum` 等）。

---

## 9. 常见陷阱与注意事项

1. **CSS Modules 无法引用跨文件 `@keyframes`**：需要在每个模块内本地声明 keyframes（如 `BrandScrollSection.module.css` 中的 `marquee`）。

2. **Tab 切换后 reveal 动画失效**：v2.3.1 已用全局 `MutationObserver` 修复。如果你新增了一个 Tab 组件且使用 `.reveal` 类，确保 Tab 切换会触发 DOM 变化（通常自然满足）。

3. **暗色模式下硬编码色值**：新增组件时，严禁在 JSX inline style 或 CSS Module 中写死 `#fff` / `#000` 等色值，必须使用 `var(--gray-900)` / `var(--page-bg)` 等语义化变量。

4. **i18n key 遗漏**：新增用户可见文本时，必须同步更新 `src/i18n/locales/zh-CN.json`、`en.json`、`zh-TW.json` 三个文件。

5. **z-index 冲突**：新增弹窗/浮层前，必须查阅上面的 z-index 表，确保不覆盖已有层级。

---

## 10. 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求文档 | `docs/prd.md` | 完整 PRD，含用户故事 |
| 项目规格 | `docs/project-spec.md` | 技术规格与验收标准 |
| 技术架构 | `docs/architecture.md` | 组件树、数据流、Hook 设计 |
| 设计系统 | `docs/design-system.md` | Token、色板、组件规范、动效 |
| 项目计划 | `docs/project-plan.md` | 路线图、Sprint 计划 |
| 风险登记册 | `docs/risk-register.md` | 技术与业务风险 |
| 测试计划 | `docs/test-plan.md` | 测试策略与用例框架 |
| 变更记录 | `CHANGELOG.md` | 所有版本变更历史（含 Bug 清单） |

---

*TalentPro HR Portal · Vue 3.5 + Vite 5 + NestJS 11 · AGENTS.md v2.6.0*
