# AGENTS.md — TalentPro HR Portal

> 本文件面向 AI 编程助手。如果你在阅读本文件，说明你即将参与 TalentPro HR Portal 项目的开发或维护。
> **当前版本**：v4.1.0 | **技术栈**：Nuxt 3.4.6 + Nitro 2.13.4 + Vue 3.5 + CSS Modules + Pinia + @nuxtjs/i18n + NestJS 11 + Prisma 6 + Redis

---

## 1. 项目概览

TalentPro HR Portal 是面向中大型企业的一体化 HR SaaS 平台官方营销门户。它是一个单页静态应用（SPA），以「预约演示」为核心转化目标，由 15 个页面 Section 组成。

- **产品定位**：B2B 企业级营销门户（Marketing Portal）
- **核心页面**：Hero → 品牌滚动 → 统计 → 产品矩阵 → AI Family → 行业方案 → 客户证言 → Logo 墙 → 为什么选我们 → 资源中心 → CTA 通栏 → 页脚
- **数据策略**：营销门户纯静态 JS 常量（`src/data/`）；博客/论坛接入后端 NestJS API（`src/api/`）
- **部署形态**：SSG 静态站点（`.output/public/` 目录直推 CDN / Nginx / Vercel）

---

## 2. 技术栈与构建

### 2.1 核心依赖

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Nuxt | 3.4.6 | 文件路由 + 自动导入 + Nitro 引擎 |
| 底层框架 | Vue | 3.5.34 | SFC + `<script setup>`，组合式 API |
| 构建工具 | Vite | 8.0.14 | 开发端口 3000，Rolldown 引擎 |
| 路由 | Nuxt 文件路由 | - | 自动基于 `src/pages/` 目录生成 |
| 状态管理 | Pinia | 3.x | `@pinia/nuxt` 模块集成 |
| i18n | @nuxtjs/i18n | 10.4.0 | 自动路由前缀 + SEO hreflang |
| 图片优化 | @nuxt/image | 2.0.0 | 自动 WebP + 响应式尺寸 |
| 样式 | CSS Modules | 原生 | 零运行时开销 |
| 语言 | JavaScript | ES Module | 无 TypeScript（后续可渐进迁移） |

**不引入 UI 组件库**（antd / MUI 等）。所有原子组件自行封装，原因：品牌视觉高度定制（渐变、玻璃态、AI 专区深色），通用库无法复用；且会显著增加包体积。

### 2.2 构建与运行命令

```bash
# 安装依赖
npm install

# 开发服务器（http://localhost:3000，SPA 模式）
npm run dev

# 生产构建 → .output/public/ 目录（SSG 静态生成）
npm run build

# 预览生产构建
npm run preview

# 纯静态生成（等效 nuxt build + nuxt generate）
npm run generate
```

**环境要求**：Node.js ≥ 18，npm ≥ 9。

### 2.3 构建配置（`nuxt.config.ts`）

- `srcDir: 'src'` — 源码目录
- `ssr: false` — 开发 SPA 模式，减少开发摩擦
- `nitro.preset: 'static'` — 生产 SSG 静态生成
- `nitro.prerender: { routes: ['/'], crawlLinks: true }` — 自动爬取预渲染
- `nitro.compressPublicAssets` — gzip + brotli 预压缩
- `components: [{ path: '~/components', pathPrefix: false }]` — 组件自动导入
- `imports.dirs: ['composables', 'stores', 'utils']` — Composables/Stores/Utils 自动导入
- `@nuxtjs/i18n` 模块 — 多语言 + 自动 hreflang
- `@pinia/nuxt` 模块 — Pinia 状态管理
- `@vite-pwa/nuxt` 模块 — PWA + Workbox
- `@nuxt/image` 模块 — 图片自动优化

---

## 3. 目录结构与模块划分

```
talentpro-v2/
├── nuxt.config.ts                # Nuxt 3 主配置（模块、SSR、Nitro、i18n、PWA）
├── package.json
├── vitest.config.ts              # Vitest 测试配置（jsdom + auto-import）
├── public/                       # 静态资源（favicon、字体、PWA 图标等）
└── src/
    ├── app.vue                   # 根组件：Provider + NuxtLayout + NuxtPage + 全局观察器
    ├── middleware/
    │   └── route.global.ts       # 全局路由中间件（认证守卫 + 页面 Meta 同步）
    ├── pages/                    # 文件路由（Nuxt 自动生成路由表）
    │   ├── index.vue             # / 首页
    │   ├── [...slug].vue         # /:pathMatch(.*)* 404 页面
    │   ├── about.vue             # /about 了解我们
    │   ├── about/team.vue        # /about/team 团队介绍
    │   ├── about/contact.vue     # /about/contact 联系我们
    │   ├── about/partners.vue    # /about/partners 合作伙伴
    │   ├── blog/index.vue        # /blog 博客列表
    │   ├── blog/[slug].vue       # /blog/:slug 博客详情
    │   ├── cases/index.vue       # /cases 客户案例列表
    │   ├── cases/[slug].vue      # /cases/:slug 案例详情
    │   ├── careers/index.vue     # /careers 招聘首页
    │   ├── careers/campus.vue    # /careers/campus 校园招聘
    │   ├── careers/social.vue    # /careers/social 社会招聘
    │   ├── careers/[id].vue      # /careers/:id 职位详情
    │   ├── forum/index.vue       # /forum 论坛话题列表
    │   ├── forum/topic/[id].vue  # /forum/topic/:id 话题详情
    │   ├── news/index.vue        # /news 新闻列表
    │   ├── news/[slug].vue       # /news/:slug 新闻详情
    │   ├── products/index.vue    # /products 产品列表
    │   ├── products/[slug].vue   # /products/:slug 产品详情
    │   ├── profile.vue           # /profile 个人中心
    │   ├── resources/index.vue   # /resources 资源中心列表
    │   ├── resources/[slug].vue  # /resources/:slug 资源详情
    │   ├── solutions/index.vue   # /solutions 解决方案列表
    │   └── solutions/[slug].vue  # /solutions/:slug 方案详情
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
    ├── stores/                   # 全局状态（Pinia + 兼容层）
    │   ├── auth.pinia.js         # Pinia auth store（SSR-safe，推荐）
    │   ├── theme.js              # 暗色模式
    │   ├── modal.js              # 预约弹窗状态
    │   ├── videoModal.js         # 视频弹窗状态
    │   ├── search.js             # 全局搜索开关
    │   └── analytics.js          # 埋点队列
    │
    ├── api/                      # 后端 API 封装
    │   ├── client.js             # Axios 实例（含 token 拦截器）
    │   ├── blog.js               # 博客 API
    │   ├── forum.js              # 论坛 API
    │   ├── case.js               # 客户案例 API
    │   ├── news.js               # 新闻 API
    │   ├── careers.js            # 招聘 API
    │   └── about.js              # 关于我们 API
    │
    ├── composables/              # 自定义 Composables（22 个）
    │   ├── useModal.js           # 弹窗状态机（含 ESC + body overflow）
    │   ├── useVideoModal.js
    │   ├── useTheme.js           # 主题切换（localStorage + prefers-color-scheme）
    │   ├── useSearch.js          # 搜索算法 + 防抖 + 键盘导航
    │   ├── useCarousel.js        # 轮播（resize 修复 + 悬停暂停）
    │   ├── useCountUp.js         # 数字递增动画（IntersectionObserver 驱动）
    │   ├── useNavScroll.js       # 导航滚动状态
    │   ├── useScrollReveal.js    # 单元素滚动入场
    │   ├── useTabs.js            # Tab 切换
    │   ├── useApiData.js         # API 数据加载（loading/error/retry）
    │   ├── useCmsData.js         # CMS 配置驱动数据加载（含 fallback）
    │   ├── useAnalytics.js       # 埋点队列 + 热力图 + 滚动深度
    │   ├── useChatBot.js         # ChatBot 状态 + SSE 流式消息
    │   ├── useCookieConsent.js   # Cookie 同意横幅
    │   ├── useFocusTrap.js       # 焦点陷阱（弹窗无障碍）
    │   ├── useLazyImage.js       # 图片懒加载
    │   ├── useRoiCalculator.js   # ROI 计算器逻辑
    │   ├── useScrollDepth.js     # 滚动深度追踪
    │   ├── useScrollLock.js      # body scroll lock
    │   ├── useAbTest.js          # A/B 测试分流
    │   └── useHeatmap.js         # 点击热力图追踪
    │
    ├── data/                     # 静态业务数据（12 个纯 JS 文件）
    │   ├── navigation.js         # NAV_LINKS + FOOTER_LINKS
    │   ├── products.js           # PRODUCT_TABS（4 Tab × 20 产品）+ PRODUCT_MAP
    │   ├── aiFamily.js           # AI_CARDS
    │   ├── industries.js         # INDUSTRY_TABS（5 行业）+ INDUSTRY_MAP
    │   ├── cases.js              # CASES（8 客户案例）+ CASE_INDUSTRIES
    │   ├── testimonials.js       # TESTIMONIALS
    │   ├── logos.js              # LOGO_ITEMS + LOGO_FILTERS
    │   ├── whyUs.js              # WHY_US_TABS + STATS_BAR
    │   ├── resources.js          # RESOURCES（16 条，8 种类型）+ RESOURCE_TYPES
    │   ├── stats.js              # STATS_DATA
    │   ├── security.js           # 安全认证数据
    │   └── searchIndex.js        # 50 条搜索索引
    │
    ├── i18n/                     # 多语言系统（v2.3.0）
    │   ├── interpolate.js        # {var} 插值
    │   ├── keyMap.js             # ID → i18n key 映射
    │   └── locales/
    │       ├── zh-CN.json        # ~772 keys
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

### 4.5 全局状态体系（Pinia + Provide 兼容层）

**Pinia Store（推荐）**：
- `useAuthStore`（`stores/auth.pinia.js`）— SSR-safe，通过 `@pinia/nuxt` 模块自动注册

**Legacy Provide 兼容层（逐步迁移中）**：
`App.vue` 仍通过 `provide()` 向下传递以下状态，子组件可通过 `inject()` 读取：

```
theme        → 亮色 / 暗色主题
search       → 全局搜索（Cmd+K）
modal        → DemoModal（z-index 2000）
videoModal   → VideoModal（z-index 3000）
analytics    → 埋点队列
auth         → 用户认证（login/register/logout）
authModal    → 登录/注册弹窗
abTest       → A/B 测试分流
```

**状态管理**：业务代码统一使用 Pinia Store 或 `provide/inject`。`@nuxtjs/i18n` 提供 `useI18n()` composable。

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

### 5.3 多语言 i18n（@nuxtjs/i18n v10）

- 3 种语言：简体中文 (`zh`)、English (`en`)、繁體中文 (`zh-TW`)
- 策略：`prefix_except_default`（默认语言无前缀，切换时自动加前缀）
- ~772 个 key，按点分隔路径访问，如 `t('nav.demo')`
- 支持 `{var}` 插值：`t('stats.customers', { n: 6000 })`
- 自动 SEO：`hreflang` link 自动生成，`<html lang>` 自动同步
- 优先级：`detectBrowserLanguage`（cookie `tp-locale`）→ 浏览器语言 → `zh`
- 业务代码统一使用 `useI18n()`，禁止 `inject('i18n')`

### 5.4 全局搜索（v2.3.0）

- `Cmd+K` / `Ctrl+K` 全局触发
- 前端本地检索 `src/data/searchIndex.js`（50 条索引）
- 加权评分：标题命中 > tags 命中 > 描述命中
- 150ms 防抖，↑↓ 键盘导航，Enter 跳转，关键词高亮

---

## 6. 测试策略

### 6.1 测试现状

本项目已具备以下自动化测试能力：

| 类型 | 工具 | 命令 | 说明 |
|------|------|------|------|
| 前端单元测试 | Vitest | `npm run test:run` | 29 个测试文件 / 127 测试，覆盖 composables / utils / pages / stores |
| 前端 E2E | Playwright | `npx playwright test` | 8 个 spec 文件，覆盖首页 / 博客 / 论坛 / 认证 / 搜索 / 主题 / 表单 |
| 后端单元测试 | Jest | `cd talentpro-backend && npm run test` | 7 个套件 / 47 测试，覆盖 auth / user / blog / forum / lead / mail |
| 后端 E2E | Jest | `cd talentpro-backend && npm run test:e2e` | 配置就绪，核心流程持续补充中 |

### 6.2 手动验证清单（每次变更后必须执行）

**P0 — 核心流程**：
1. `npm run dev` 正常启动，控制台无报错
2. `npm run build` 构建成功，20 条路由预渲染通过，无 warning
3. `npm run test:run` 和 `npx playwright test` 全部通过
4. 首页 15 个 Section 全部可见，无白屏
5. 导航下拉菜单：鼠标从一级移向二级时**不消失**
6. 产品矩阵 / 行业方案 / 为什么选我们：Tab 切换正常，内容联动
7. 客户证言轮播：自动播放、左右切换、hover 暂停、resize 不跳位
8. Logo 墙：行业筛选后 grid 不错位
9. 预约演示弹窗：3 步骤流程、表单填写、成功态、ESC 关闭
10. 全局搜索：Cmd+K 触发、输入关键词、↑↓ 导航、Enter 跳转、Esc 关闭
11. 暗色模式：切换后所有 Section 颜色正常，无硬编码未覆盖色值
12. 多语言：切换语言后所有文本正常，无遗漏 key
13. **博客/论坛**：路由跳转正常，列表加载、详情渲染、分页/筛选正常
14. **用户认证**：登录/注册弹窗、表单验证、登录后头像下拉、退出登录正常
15. **产品列表/详情**：Tab 筛选正常，详情页功能/场景/证言/规格全部渲染
16. **解决方案列表/详情**：行业卡片指标正常，详情页痛点/架构/路径/案例/ROI 渲染
17. **客户案例列表/详情**：行业筛选正常，Featured 案例突出，详情页挑战/方案/成果/证言渲染
18. **资源中心列表/详情**：8 类标签筛选正常，Featured 精选区渲染，详情页下载 CTA 正常
19. **新闻列表/详情**：Featured 新闻渲染正常，详情页正文段落化
20. **加入我们**：校园/社会招聘入口正常，职位列表筛选正常，职位详情申请按钮正常
21. **了解我们**：团队/合作伙伴/联系我们入口正常，表单提交正常
22. **后端 API**：Swagger 文档正常，`/health` 端点返回 200

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

产物输出到 `.output/public/` 目录，可直接部署到：
- Vercel / Netlify（Git 集成，Nuxt 原生支持）
- Nginx（`location / { try_files $uri $uri/ /index.html; }`）
- OSS + CDN（阿里云、腾讯云等）
- Docker（`docker/Dockerfile.frontend` 多阶段构建）

**注意**：
- Nuxt SSG 已预渲染全部 20 条路由为静态 HTML，首屏无需 JavaScript 即可渲染
- SPA fallback 仍需要 `try_files $uri $uri/ /index.html;` 支持动态路由（如 `/blog/:slug`）
- Nginx root 路径应指向 `.output/public/` 而非旧 `dist/`

---

## 9. 常见陷阱与注意事项

1. **CSS Modules 无法引用跨文件 `@keyframes`**：需要在每个模块内本地声明 keyframes（如 `BrandScrollSection.module.css` 中的 `marquee`）。

2. **Tab 切换后 reveal 动画失效**：v2.3.1 已用全局 `MutationObserver` 修复。如果你新增了一个 Tab 组件且使用 `.reveal` 类，确保 Tab 切换会触发 DOM 变化（通常自然满足）。

3. **暗色模式下硬编码色值**：新增组件时，严禁在 JSX inline style 或 CSS Module 中写死 `#fff` / `#000` 等色值，必须使用 `var(--gray-900)` / `var(--page-bg)` 等语义化变量。

4. **i18n key 遗漏**：新增用户可见文本时，必须同步更新 `src/i18n/locales/zh-CN.json`、`en.json`、`zh-TW.json` 三个文件。已提取的 key 包括 `careers.benefits.*`、`blog.jsonLdName` / `blog.jsonLdDesc` 等。

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

## 11. v3.0.0 新增架构规范

### 安全
- ChatBot 消息渲染必须使用 `escapeHtml` 转义后再 `v-html`
- 所有 API 端点默认受 `ThrottlerGuard` 限流保护（全局注册）
- JWT logout 必须将 Access Token 写入 `TokenBlacklist`
- 密码策略：≥8位，含大小写+数字+特殊字符

### 缓存
- CMS 公开 GET 接口必须使用 `@Cacheable({ key, ttl })`
- CacheInterceptor 已全局注册，无需额外导入
- **`@CacheEvict` 支持 `keys: string[]` 数组**（推荐）：当需要同时清除多个缓存 key 时，使用 `@CacheEvict({ keys: ['cms:sections', 'cms:page'] })`，避免多个装饰器叠加导致 `SetMetadata` 覆盖

### 事件驱动
- BullMQ Processor 必须配置 `attempts: 3` + `exponential backoff`
- 必须实现 `@OnWorkerEvent('failed')` 记录死信

### SEO
- Blog/Forum 详情页加载后必须动态更新 `document.title` + `meta description`
- JSON-LD 结构化数据中的用户可见文本必须使用 i18n key，禁止硬编码中文

### PII 字段级加密
- User.phone / DemoBooking.phone / email 等敏感字段通过 Prisma 扩展自动 AES-256-GCM 加解密
- 密钥来源优先级：`PII_ENCRYPTION_KEY` 环境变量 → `JWT_SECRET`（fallback，记录警告日志）
- 加密扩展在 `softDeleteExtension` 之后、workspace 扩展之前应用

### SSE Redis Pub/Sub
- Notification 实时推送使用 Redis Pub/Sub 支持多实例集群
- 全局仅 1 个 Redis psubscribe 连接（`psubscribe('sse:notifications:*')`）
- Channel 命名规范：`sse:notifications:{userId}`

### Icon 组件
- `Icon.vue` 从 554 行 monolithic 组件重构为 25 行入口 + `IconSprite.vue` SVG Sprite
- 所有图标通过 `<use :href="#icon-{name}" />` 引用，现有用法 `<Icon name="xxx" />` 零改动
- `App.vue` 全局挂载 `<IconSprite />` 一次注入全部 78 个图标定义

### 响应拦截器
- `TransformInterceptor` 使用内部 `Symbol('transformed')` 标记已包装响应，避免 `'success' in data` 误判含 `success` 字段的业务数据

### 分页辅助
- 所有 Service 分页查询统一使用 `getSkip(page, pageSize)` 和 `buildPaginatedResponse(data, page, pageSize, total)`，禁止内联重复 `const skip = (page - 1) * pageSize`

### Admin 权限体系
- 路由守卫 (`router.beforeEach`) 同时检查 `to.meta.roles` 和 `to.meta.permissions`，权限不足时重定向到 `/dashboard`
- `menu.config.js` 支持 `permissions` + `permissionMode` ('all' | 'any') 字段，`hasMenuPermission(item, userRole, auth)` 同时校验 roles 和 permissions
- `auth.store.js` 的 `permissions` computed 从 `user.role.permissions` 解析，自动将 `{ resource, action }` 对象数组转换为 `resource:action` 字符串数组
- **菜单显示由 `visibleMenu` + `hasMenuPermission` 控制，禁止在菜单项上直接使用 `v-permission` 指令**（`v-permission` 接收权限字符串，而 `roles` 是角色数组，会导致非 SUPER_ADMIN 用户菜单被错误隐藏）
- `v-permission` 指令仅用于按钮/操作级别的细粒度控制

### Admin CmsTable
- 表单字段支持 `<slot :name="'form-field-' + field.prop" :field="field" :form="form">` 自定义插槽，调用方可注入 select / date-picker / relation-picker 等控件
- 内置默认渲染（input / textarea / switch / number / image-upload）与 slot 并存，向下兼容原有 `formFields` 配置
- 支持 `apiParams` prop 传递额外查询参数，支持 `defineExpose({ setParams, params, fetch, refresh })` 供父组件控制筛选

### BaseCrudRepository
- 单一模型 CRUD 通过 `extends BaseCrudRepository` + `super(prisma, 'modelName')` 实现，已迁移模块：News、Media、ForumCategory、ForumTopic、Job、CaseStudy、BlogCategory、BlogTag
- `findAll` / `findOne` / `findBySlug` / `create` / `update` / `upsert` / `delete` 均支持可选的 `include` / `select` 参数
- Service 层组合 Repository 并保留业务逻辑（如 viewCount++、workspace 权限检查、聚合查询）
- CMS 内容类型使用 `CmsContentRepository.forModel(modelName)` 工厂模式，避免为每个模型创建独立 Repository 类，已应用于：productTab、product、industry、testimonial、stat、clientLogo、whyUsTab、aiCard、resource、resourceCategory、page、section

### CI/CD
- 代码提交触发 GitHub Actions：前端构建 + Vitest + 后端 Nest build + E2E
- 生产部署使用 `docker/Dockerfile` 多阶段构建
- 前端产物路径：`.output/public/`（Nuxt SSG 输出）

---

## 12. v4.0.0 Nuxt 3 迁移规范（新增）

### Nuxt 文件路由
- `src/pages/` 目录下的 `.vue` 文件自动生成路由，无需手动维护路由表
- 动态路由使用方括号：`[slug].vue`、 `[id].vue`
- 404 通配符使用省略号：`[...slug].vue`
- 页面级 meta 通过 `definePageMeta({ title: 'key', description: 'key' })` 声明
- 旧 `src/router/index.js` 和 `src/router/guards.js` 已删除，不可恢复

### 全局路由中间件
- `src/middleware/route.global.ts` 替代原 Vue Router `router.beforeEach`
- 认证守卫、页面 title/meta 同步在此统一处理
- 中间件中通过 `useAuthStore()` 读取 Pinia 状态，`useI18n()` 读取翻译

### 自动导入（Auto Imports）
- `composables/`、`stores/`、`utils/` 目录下的导出自动全局可用
- `components/` 目录下的组件自动注册（`pathPrefix: false`）
- **严禁**在 `.vue` 文件中手动 `import { ref, computed } from 'vue'`（除非 ESLint 要求）
- 测试环境中通过 `unplugin-auto-import/vite` 模拟自动导入

### SSR 安全清单
- `ssr: false` 开发模式，但 Nitro 预渲染会执行部分服务端逻辑
- 任何 `window` / `document` / `localStorage` 访问必须包裹在 `onMounted` 或 `process.client` 中
- Pinia store 中访问 `localStorage` 必须通过 `typeof window !== 'undefined'` 保护
- `@nuxtjs/i18n` 在服务端会自动初始化，无需手动 `createI18n()`

### 数据获取
- 首页/列表/详情页优先使用 `useAsyncData()` + `$fetch`
- `useAsyncData` 的 `key` 必须全局唯一，建议格式：`cms-{pageKey}`、`blog-{slug}`
- `{ server: false }` 强制客户端获取（用于需要浏览器的 API）
- 保留 `{ default: () => fallbackData }` 作为骨架屏数据源

### 图片优化（@nuxt/image）
- 所有 `<img>` 替换为 `<NuxtImg>`，自动获得 WebP 转换 + 响应式尺寸
- 配置 `placeholder` 属性启用模糊占位图
- 远程图片需配置 `domains` 白名单（`nuxt.config.ts` → `image.domains`）

### 构建产物
- 产物输出至 `.output/public/`（非旧 `dist/`）
- CI/CD artifact 路径已同步更新
- `nitro.compressPublicAssets` 预生成 gzip + brotli 压缩文件
- 静态资源（`_nuxt/**`、`fonts/**`）配置 1 年长期缓存头

---

## 13. v4.1.0 交易与扩展模块规范（新增）

### Marketplace 模块
- **后端**：`talentpro-backend/apps/api/src/modules/marketplace/`
  - Controller: `MarketplaceController`（公开 API）+ `MarketplaceAdminController`（管理后台）
  - Service: `MarketplaceService` — 应用列表/精选/分类/评论/安装/订阅管理
  - Repository: `MarketplaceRepository extends BaseCrudRepository`
  - 模型：`App`, `AppCategory`, `AppVendor`, `AppReview`, `Subscription`
- **Admin 后台**：`talentpro-admin/src/views/AppManagerView.vue` / `CategoryManagerView.vue` / `ReviewManagerView.vue` / `VendorManagerView.vue`
- **前端**：`src/pages/marketplace/index.vue`（列表）+ `src/pages/marketplace/[slug].vue`（详情）
- **静态 fallback**：`src/data/marketplace.js` — `MARKETPLACE_APPS`, `MARKETPLACE_APP_MAP`, `MARKETPLACE_CATEGORIES`

### Payment 模块
- **后端**：`talentpro-backend/apps/api/src/modules/payment/`
  - Stripe Checkout + Webhook 处理
  - 订单生命周期：`PENDING` → `COMPLETED` / `FAILED` / `REFUNDED`
  - `PaymentService.createOrder()` / `findOrders()` / `createStripeCheckout()` / `handleStripeWebhook()`
- **前端**：`src/pages/marketplace/payment/success.vue` + `cancel.vue`
- **环境变量**：`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Cart 模块
- **后端**：`talentpro-backend/apps/api/src/modules/cart/`
  - Redis TTL 7 天（`cart:{userId}`）
  - `CartService` — `getCart` / `addItem` / `updateItem` / `removeItem` / `clearCart`
- **前端**：`src/components/ui/CartButton/CartButton.vue`

### Bull 队列注册规范
- 任何使用 `@InjectQueue('queue-name')` 的 Listener 必须在 **其所在模块** 或 **AppModule** 中通过 `BullModule.registerQueue({ name: 'queue-name' })` 注册
- 已注册队列：`notification`, `search-index`, `lead-nurture`
- `@Processor('queue-name')` 不需要显式注册队列（使用全局连接）

---

*TalentPro HR Portal · Nuxt 3.4.6 + Vue 3.5 + NestJS 11 · AGENTS.md v4.1.0*
