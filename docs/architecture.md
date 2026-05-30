# TalentPro HR Portal — 系统架构文档

> **版本**：v3.0.0 | **负责角色**：架构师 Agent | **状态**：✅ 已同步最新实现
> **最后更新**：2026-05-28
> **输入依据**：`AGENTS.md` + 实际代码库

---

## 目录

1. [技术选型（ADR）](#1-技术选型adr)
2. [系统架构概览](#2-系统架构概览)
3. [组件树](#3-组件树)
4. [目录结构](#4-目录结构)
5. [Hooks 架构](#5-hooks-架构)
6. [数据层架构](#6-数据层架构)
7. [样式架构](#7-样式架构)
8. [组件规范](#8-组件规范)
9. [关键交互实现策略](#9-关键交互实现策略)
10. [构建与部署方案](#10-构建与部署方案)

---

## 1. 技术选型（ADR）

### ADR-001：前端框架

| 维度 | 决策 | 原因 |
|------|------|------|
| **框架** | Vue 3.5 | SFC + `<script setup>` 组合式 API，与 Element Plus 生态对齐 |
| **构建工具** | Vite 8.0.14 | 冷启动 < 500ms，HMR 毫秒级，原生支持 Vue SFC，Rolldown 引擎 |
| **语言** | JavaScript | 营销门户无复杂类型需求；TypeScript 后续可渐进迁移 |
| **样式方案** | CSS Modules + CSS 自定义属性 | 零运行时开销，原生支持 Design Token，与现有变量体系无缝迁移 |
| **动效** | CSS Keyframes + IntersectionObserver（原生）| 无需引入动效库，视觉还原度最高 |
| **状态管理** | Vue `ref`/`computed` + `provide/inject` | 自定义 store 工厂函数（`createI18n`/`createTheme`/`createModal` 等）|
| **路由** | Vue Router 4 | 博客/论坛多页面路由，`<router-view>` 挂载于 App.vue |
| **部署** | 静态站点（Vite build → dist/）| Vercel / Nginx / OSS+CDN 均可直接托管 |

**后端技术栈**

| 维度 | 决策 | 原因 |
|------|------|------|
| **框架** | NestJS 11 | 模块化架构，内置 DI/IOC，与 Prisma 生态深度整合 |
| **ORM** | Prisma 6 | 类型安全查询，自动迁移，PostgreSQL 原生支持 |
| **数据库** | PostgreSQL 16 | 关系型数据 + JSONB 扩展，ACID 保障 |
| **缓存** | Redis 7 | 会话/缓存/限流，高性能 KV 存储 |
| **搜索** | Meilisearch | 全文搜索，实时索引，轻量部署 |
| **存储** | MinIO | S3 兼容对象存储，图片/文件托管 |
| **认证** | JWT（Access + Refresh Token）| 无状态认证，refresh token 轮转防劫持 |

**不引入 UI 组件库的原因**：现有设计系统高度定制（品牌渐变、玻璃态、AI 专区深色等），通用库无法复用；antd 等库压缩后仍 > 400KB，对 Lighthouse 分数不利；所有原子组件实现简单，自行封装成本低。

---

## 2. 系统架构概览

```
┌────────────────────────────────────────────────────────────────┐
│                     TalentPro 系统架构                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               营销门户（Vue 3 SPA）                        │  │
│  │  I18nProvider → ThemeProvider → SearchProvider            │  │
│  │  → ModalContext → VideoModalContext → AuthProvider         │  │
│  │  │                                                       │  │
│  │  ├── NavBar                    [SEC-01] 固定顶部导航       │  │
│  │  ├── <router-view>                                         │  │
│  │  │   ├── HomePage           [SEC-02~14] 15 个 Section     │  │
│  │  │   ├── ProductListView    产品列表（Tab 筛选）            │  │
│  │  │   ├── ProductDetailView  产品详情（功能/场景/证言/规格） │  │
│  │  │   ├── SolutionListView   解决方案列表（行业卡片）        │  │
│  │  │   ├── SolutionDetailView 方案详情（痛点/架构/路径/案例） │  │
│  │  │   ├── CaseListView       客户案例列表（行业筛选）        │  │
│  │  │   ├── CaseDetailView     案例详情（挑战/方案/成果/证言）│  │
│  │  │   ├── ResourceListView   资源中心（8 类标签筛选）        │  │
│  │  │   ├── ResourceDetailView 资源详情（下载 CTA）            │  │
│  │  │   ├── NewsListView       新闻列表（Featured + 网格）    │  │
│  │  │   ├── NewsDetailView     新闻详情（封面图 + 正文）       │  │
│  │  │   ├── CareersView        招聘首页（双通道 + 福利）       │  │
│  │  │   ├── CampusCareersView  校园招聘（三大项目）            │  │
│  │  │   ├── SocialCareersView  社会招聘（文化/成长）           │  │
│  │  │   ├── JobDetailView      职位详情（描述/要求/申请）      │  │
│  │  │   ├── AboutView          了解我们（故事/价值观/数据）    │  │
│  │  │   ├── TeamView           团队介绍（成员网格）            │  │
│  │  │   ├── ContactView        联系我们（信息 + 表单）         │  │
│  │  │   ├── PartnersView       合作伙伴（Logo 网格）           │  │
│  │  │   ├── BlogListView       博客列表（分类+分页）           │  │
│  │  │   ├── BlogDetailView     博客详情（Markdown）            │  │
│  │  │   ├── ForumView          论坛话题列表                   │  │
│  │  │   ├── ForumTopicView     话题详情+回复                  │  │
│  │  │   └── ProfilePage        个人中心                       │  │
│  │  ├── Footer                    [SEC-13]                   │  │
│  │  └── DemoModal / AuthModal / SearchModal / ChatBot        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↑ HTTP API (REST)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               后端服务（NestJS 11 + Prisma 6）              │  │
│  │  ├── Auth Module      注册/登录/JWT/刷新/权限              │  │
│  │  ├── Blog Module      文章/分类/标签 CRUD                  │  │
│  │  ├── Forum Module     话题/回复/置顶/锁定                  │  │
│  │  ├── Lead Module      演示预约线索管理                     │  │
│  │  ├── Analytics Module 页面浏览/事件/转化漏斗               │  │
│  │  └── User Module      用户管理                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↑ HTTP API (REST + JWT)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               管理后台（Vue 3 + Element Plus）              │  │
│  │  ├── LoginView.vue        登录页                           │  │
│  │  ├── LayoutView.vue       侧边栏 + 顶部栏布局              │  │
│  │  ├── DashboardView.vue    仪表盘                           │  │
│  │  ├── BlogManagerView.vue  博客管理                         │  │
│  │  ├── ForumManagerView.vue 论坛管理                         │  │
│  │  ├── AnalyticsView.vue    数据分析                         │  │
│  │  ├── UsersView.vue        用户管理                         │  │
│  │  └── LeadsView.vue        线索管理                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
         ↓ Vite Build
      dist/（静态产物）→ CDN / Vercel / Nginx
```

---

## 3. 组件树

### 3.1 完整层级

```
App
├── ModalContext.Provider
│
├── NavBar                                  layout/NavBar/NavBar.vue
│   ├── NavLogo
│   ├── NavLinks
│   │   ├── NavItem（无下拉）×2            ← 客户案例、资源中心
│   │   └── NavItem（有下拉）×3            ← AI Family、产品、解决方案
│   │       └── NavDropdown
│   │           ├── NavDropItem ×4
│   │           └── NavDropBanner（底部推广）
│   ├── NavRight（电话 + 登录 + CTA 按钮）
│   └── MobileMenu                          layout/NavBar/MobileMenu.vue
│       ├── MobNavItem（可展开 accordion）×3
│       │   └── MobSubItem ×4
│       ├── MobDirectLink ×2
│       └── MobileMenuFooter（电话 + CTA）
│
├── HomePage                                pages/HomePage.vue
│   │
│   ├── HeroSection                         sections/HeroSection/
│   │   ├── HeroTag（IDC 徽章）
│   │   ├── HeroTitle（含渐变关键词）
│   │   ├── HeroSubtitle
│   │   ├── HeroCtas（预约演示 + 观看视频）
│   │   ├── HeroTrustBar（3 个信任点）
│   │   └── HeroDashboard（右侧浮动截图装饰）
│   │
│   ├── BrandScrollSection                  sections/BrandScrollSection/
│   │   └── MarqueeTrack（品牌 Logo 无限滚动）
│   │
│   ├── StatsSection                        sections/StatsSection/
│   │   └── StatCard ×6                    ← useCountUp
│   │
│   ├── ProductMatrixSection                sections/ProductMatrixSection/
│   │   ├── SectionHeader
│   │   ├── TabNav（4 tabs）               ← useTabs
│   │   └── TabPanel ×4
│   │       └── ProductCard ×N             4列网格
│   │
│   ├── AiFamilySection                     sections/AiFamilySection/
│   │   ├── SectionHeader（dark variant）
│   │   ├── AiCard ×4（玻璃态，HOT 徽章）
│   │   └── AiBannerCard（跨 2 列宣传 Banner）
│   │
│   ├── IndustrySolutionSection             sections/IndustrySolutionSection/
│   │   ├── SectionHeader
│   │   ├── IndustryTabNav（5 tabs）        ← useTabs
│   │   └── IndustryPanel ×5
│   │       ├── FeatureList
│   │       │   └── FeatureItem ×3
│   │       └── ProductScreenshot
│   │
│   ├── TestimonialSection                  sections/TestimonialSection/
│   │   ├── SectionHeader
│   │   └── Carousel                       ← useCarousel（BUG-02/03 修复）
│   │       ├── TestimonialCard ×4
│   │       ├── CarouselPrevBtn / NextBtn
│   │       └── CarouselDots
│   │
│   ├── LogoWallSection                     sections/LogoWallSection/
│   │   ├── SectionHeader
│   │   ├── LogoFilterBar（6 个筛选按钮）   ← ref(activeFilter)
│   │   └── LogoGrid
│   │       └── LogoItem ×12
│   │
│   ├── WhyUsSection                        sections/WhyUsSection/
│   │   ├── SectionHeader（dark variant）
│   │   ├── WhyUsTabNav（3 tabs）           ← useTabs
│   │   ├── WhyUsPanel ×3
│   │   │   └── MetricCard ×4
│   │   └── StatsBar
│   │       └── StatsBarItem ×6            ← useCountUp
│   │
│   ├── ResourceSection                     sections/ResourceSection/
│   │   ├── SectionHeader
│   │   └── ResourceCard ×3（v2.1.0 扩展至 6）
│   │
│   ├── CtaBannerSection                    sections/CtaBannerSection/
│   │   └── [标题 + 副标题 + 双按钮]
│   │
│   └── FloatingBar                         sections/FloatingBar/
│       └── FloatingBtn ×4
│           桌面：右侧竖排 | 移动：底部横排（< 768px）
│
├── Footer                                  layout/Footer/Footer.vue
│   ├── FooterBrandCol（Logo+简介+电话+Tags）
│   └── FooterLinkCol ×3（产品/资源/关于）
│
└── DemoModal                               ui/DemoModal/DemoModal.vue
    ├── ModalOverlay（点击遮罩关闭）
    ├── StepIndicator（3 步进度条）
    ├── ModalStep1（姓名+公司+手机+验证码）
    │   └── VerifyCodeField（60s 倒计时）
    ├── ModalStep2（产品多选 Pills）
    ├── ModalStep3（企业规模单选 Pills）
    └── ModalSuccess（2.5s 自动关闭）
```

### 3.2 共享 UI 原子组件（`src/components/ui/`）

| 组件 | 功能 | Variants |
|------|------|---------|
| `Button` | 全局按钮 | `primary` \| `ghost` \| `outline` \| `white` |
| `Tag` | Section 前置胶囊标签 | `light`（默认）\| `dark`（深色区）\| `ai`（紫色）|
| `Badge` | 内联徽章（HOT / 类型标记）| `hot` \| `type` |
| `SectionHeader` | 通用区块标题（tag + h2 + subtitle）| `light` \| `dark` |
| `TabNav` | 通用 Tab 导航 | `pill`（行业/WhyUs）\| `underline`（产品矩阵）|
| `RevealWrapper` | 滚动入场动画 HOC | `delay`: 0~5 |
| `DemoModal` | 预约演示完整弹窗 | — |

---

## 4. 目录结构

```
talentpro/
├── index.html                      # Vite HTML 入口
├── vite.config.js
├── package.json
├── .eslintrc.cjs
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.js                     # createApp + router 挂载
│   ├── App.vue                     # 根组件：5 层 Provider + router-view
│   ├── router/
│   │   └── index.js                # Vue Router：24 条路由（首页 + 二级页面 + 博客/论坛/认证）
│   │
│   ├── stores/
│   │   ├── i18n.js                 # I18nProvider + useI18n
│   │   ├── theme.js                # ThemeProvider + toggle
│   │   ├── modal.js                # DemoModal 状态
│   │   ├── videoModal.js           # VideoModal 状态
│   │   ├── search.js               # SearchProvider
│   │   ├── analytics.js            # 埋点队列
│   │   └── auth.js                 # Auth store（login/register/logout）
│   │
│   ├── api/
│   │   ├── client.js               # Axios 实例（含 token 拦截器）
│   │   ├── blog.js                 # 博客 API 封装
│   │   └── forum.js                # 论坛 API 封装
│   │
│   ├── tokens/
│   │   └── index.js                # ⭐ Design Token JS 常量（唯一真相来源）
│   │
│   ├── styles/
│   │   ├── global.css              # :root CSS 变量 + Reset + body/a/img
│   │   ├── animations.css          # @keyframes: fadeUp/float/gradShift/marquee/pulse
│   │   └── reveal.css              # .reveal / .is-visible / .reveal-delay-N
│   │
│   ├── hooks/
│   │   ├── useNavScroll.js         # 滚动位置 → scrolled 态 + 回到顶部
│   │   ├── useScrollReveal.js      # IntersectionObserver → is-visible
│   │   ├── useCountUp.js           # 数字递增动画
│   │   ├── useCarousel.js          # 轮播（含 resize 修复 + 悬停暂停）
│   │   ├── useTabs.js              # Tab 切换
│   │   └── useModal.js             # 弹窗状态机（含 ESC + body overflow）
│   │
│   ├── data/
│   │   ├── navigation.js           # NAV_LINKS + FOOTER_LINKS（导航与页脚）
│   │   ├── stats.js                # STATS_DATA（统计数字）
│   │   ├── products.js             # PRODUCT_TABS（4 Tab × 20 产品）+ PRODUCT_MAP
│   │   ├── aiFamily.js             # AI_CARDS（AI 专区卡片）
│   │   ├── industries.js           # INDUSTRY_TABS（5 行业方案）+ INDUSTRY_MAP
│   │   ├── cases.js                # CASES（8 客户案例）+ CASE_INDUSTRIES
│   │   ├── testimonials.js         # TESTIMONIALS（客户证言 4 条）
│   │   ├── logos.js                # LOGO_ITEMS + LOGO_FILTERS
│   │   ├── whyUs.js                # WHY_US_TABS + STATS_BAR
│   │   ├── resources.js            # RESOURCES（16 条，8 种类型）+ RESOURCE_TYPES
│   │   ├── security.js             # 安全认证数据
│   │   └── searchIndex.js          # 50 条搜索索引
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── NavBar/
│   │   │   │   ├── NavBar.vue
│   │   │   │   ├── NavBar.module.css
│   │   │   │   ├── NavDropdown.vue
│   │   │   │   ├── NavDropdown.module.css
│   │   │   │   ├── MobileMenu.vue
│   │   │   │   └── MobileMenu.module.css
│   │   │   └── Footer/
│   │   │       ├── Footer.vue
│   │   │       └── Footer.module.css
│   │   │
│   │   ├── sections/
│   │   │   ├── HeroSection/
│   │   │   │   ├── HeroSection.vue
│   │   │   │   └── HeroSection.module.css
│   │   │   ├── BrandScrollSection/
│   │   │   │   ├── BrandScrollSection.vue
│   │   │   │   └── BrandScrollSection.module.css
│   │   │   ├── StatsSection/
│   │   │   ├── ProductMatrixSection/
│   │   │   │   ├── ProductMatrixSection.vue
│   │   │   │   ├── ProductMatrixSection.module.css
│   │   │   │   └── ProductCard.vue
│   │   │   ├── AiFamilySection/
│   │   │   │   ├── AiFamilySection.vue
│   │   │   │   ├── AiFamilySection.module.css
│   │   │   │   └── AiCard.vue
│   │   │   ├── IndustrySolutionSection/
│   │   │   │   ├── IndustrySolutionSection.vue
│   │   │   │   ├── IndustrySolutionSection.module.css
│   │   │   │   ├── IndustryPanel.vue
│   │   │   │   └── ProductScreenshot.vue
│   │   │   ├── TestimonialSection/
│   │   │   │   ├── TestimonialSection.vue
│   │   │   │   ├── TestimonialSection.module.css
│   │   │   │   └── TestimonialCard.vue
│   │   │   ├── LogoWallSection/
│   │   │   │   ├── LogoWallSection.vue
│   │   │   │   └── LogoWallSection.module.css
│   │   │   ├── WhyUsSection/
│   │   │   │   ├── WhyUsSection.vue
│   │   │   │   ├── WhyUsSection.module.css
│   │   │   │   └── MetricCard.vue
│   │   │   ├── ResourceSection/
│   │   │   │   ├── ResourceSection.vue
│   │   │   │   ├── ResourceSection.module.css
│   │   │   │   └── ResourceCard.vue
│   │   │   ├── CtaBannerSection/
│   │   │   │   ├── CtaBannerSection.vue
│   │   │   │   └── CtaBannerSection.module.css
│   │   │   └── FloatingBar/
│   │   │       ├── FloatingBar.vue
│   │   │       └── FloatingBar.module.css
│   │   │
│   │   └── ui/
│   │       ├── Button/
│   │       │   ├── Button.vue
│   │       │   └── Button.module.css
│   │       ├── Tag/
│   │       ├── Badge/
│   │       ├── SectionHeader/
│   │       │   ├── SectionHeader.vue
│   │       │   └── SectionHeader.module.css
│   │       ├── TabNav/
│   │       │   ├── TabNav.vue
│   │       │   └── TabNav.module.css
│   │       ├── RevealWrapper/
│   │       │   └── RevealWrapper.vue
│   │       └── DemoModal/
│   │           ├── DemoModal.vue
│   │           ├── DemoModal.module.css
│   │           ├── ModalStep1.vue
│   │           ├── ModalStep2.vue
│   │           ├── ModalStep3.vue
│   │           └── ModalSuccess.vue
│   │
│   └── pages/
│       └── HomePage.vue            # 组装所有 Section
│
├── docs/
└── dist/                           # 构建产物（gitignore）
```

---

## 5. Composables 架构

每个 Composable 遵循**单一职责原则**，封装一个具体交互场景的完整状态与副作用。

### `useNavScroll` — 导航栏滚动状态

```js
import { ref, onMounted, onUnmounted } from 'vue';

// 返回：{ scrolled: boolean, showBackTop: boolean }
// 解决：替代原生 scroll 监听，被 NavBar 和 FloatingBar 消费
export function useNavScroll() {
  const scrolled = ref(false);
  const showBackTop = ref(false);

  const handler = () => {
    scrolled.value = window.scrollY > 60;
    showBackTop.value = window.scrollY > 500;
  };

  onMounted(() => window.addEventListener('scroll', handler, { passive: true }));
  onUnmounted(() => window.removeEventListener('scroll', handler));

  return { scrolled, showBackTop };
}
```

### `useScrollReveal` — 滚动入场动画

```js
import { ref, onMounted, onUnmounted } from 'vue';

// 用法：const elRef = useScrollReveal()
//       <div ref="elRef" :class="styles.reveal">...</div>
export function useScrollReveal(threshold = 0.1) {
  const elRef = ref(null);
  let obs = null;

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;
    obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('is-visible'); },
      { threshold }
    );
    obs.observe(el);
  });

  onUnmounted(() => { if (obs) obs.disconnect(); });

  return elRef;
}
```

### `useCountUp` — 数字递增动画

```js
import { ref, onMounted, onUnmounted } from 'vue';

// 用法：const elRef = useCountUp(6000, { suffix: '+' })
//       <span ref="elRef" />
export function useCountUp(target, { duration = 1600, suffix = '' } = {}) {
  const elRef = ref(null);
  let obs = null;

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;
    obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !el.dataset.done) {
        el.dataset.done = '1';
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  onUnmounted(() => { if (obs) obs.disconnect(); });

  return elRef;
}
```

### `useCarousel` — 轮播状态管理（修复 BUG-02 / BUG-03）

```js
import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useCarousel(itemCount, { autoPlayInterval = 4500 } = {}) {
  const currentIdx = ref(0);
  const trackRef = ref(null);
  let timer = null;

  const getColCount = () => {
    const w = trackRef.value?.parentElement?.offsetWidth ?? 1200;
    return w > 900 ? 3 : w > 600 ? 2 : 1;
  };

  const goTo = (idx) => {
    const max = Math.max(0, itemCount - getColCount());
    currentIdx.value = Math.max(0, Math.min(idx ?? currentIdx.value, max));
  };

  const stopAutoPlay = () => { if (timer) clearInterval(timer); };
  const startAutoPlay = () => {
    stopAutoPlay();
    timer = setInterval(() => {
      const max = Math.max(0, itemCount - getColCount());
      currentIdx.value = currentIdx.value >= max ? 0 : currentIdx.value + 1;
    }, autoPlayInterval);
  };

  // Resize 防抖（BUG-02）
  onMounted(() => {
    let t;
    const handler = () => { clearTimeout(t); t = setTimeout(() => goTo(currentIdx.value), 200); };
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('resize', handler); clearTimeout(t); };
  });

  onMounted(() => { startAutoPlay(); });
  onUnmounted(() => { stopAutoPlay(); });

  return { currentIdx, goTo, trackRef, startAutoPlay, stopAutoPlay, getColCount };
}
```

### `useTabs` — 通用 Tab 切换

```js
import { ref } from 'vue';

// 产品矩阵 / 行业方案 / 为什么选我们 三处共用
export function useTabs(initialIndex = 0) {
  const activeIndex = ref(initialIndex);
  const selectTab = (idx) => { activeIndex.value = idx; };
  return { activeIndex, selectTab };
}
```

### `useModal` — 弹窗状态机

```js
import { ref, watch, onMounted, onUnmounted } from 'vue';

// 状态：关闭 → Step0 → Step1 → Step2 → 成功 → 自动关闭
export function useModal() {
  const isOpen = ref(false);
  const step = ref(0);
  const isSuccess = ref(false);

  const closeModal = () => {
    isOpen.value = false;
    setTimeout(() => { step.value = 0; isSuccess.value = false; }, 350);
  };

  const openModal = () => { isOpen.value = true; };
  const nextStep = () => { step.value = Math.min(step.value + 1, 2); };
  const submitForm = () => {
    isSuccess.value = true;
    setTimeout(closeModal, 2500);
  };

  watch(isOpen, (val) => {
    document.body.style.overflow = val ? 'hidden' : '';
  });

  onMounted(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen.value) closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return { isOpen, step, isSuccess, openModal, closeModal, nextStep, submitForm };
}
```

---

## 6. 数据层架构

所有静态内容以纯 JS 常量存于 `src/data/`，与组件完全解耦，支持后续接入 CMS / API。

```js
// 示例 src/data/products.js
export const PRODUCT_TABS = [
  {
    id: 'hr-saas',
    label: '一体化 HR SaaS',
    products: [
      { id: 'recruit', name: '招聘管理', icon: '👥', desc: '全流程数字化招聘管理', link: '#' },
      { id: 'performance', name: '绩效管理', icon: '📊', desc: '目标对齐、绩效驱动', link: '#' },
      // ...共 8 项
    ]
  },
  { id: 'ai-family', label: 'AI Family', products: [...] },
  { id: 'assessment', label: '人才测评', products: [...] },
  { id: 'paas', label: 'PaaS 平台', products: [...] },
];
```

**数据文件 → 消费组件映射**：

| 数据文件 | 导出 | 消费组件 |
|---------|------|---------|
| `navigation.js` | `NAV_LINKS`, `FOOTER_LINKS` | NavBar, MobileMenu, Footer |
| `stats.js` | `STATS_DATA` | StatsSection |
| `products.js` | `PRODUCT_TABS`, `PRODUCT_MAP` | ProductMatrixSection, ProductListView, ProductDetailView |
| `aiFamily.js` | `AI_CARDS` | AiFamilySection |
| `industries.js` | `INDUSTRY_TABS`, `INDUSTRY_MAP` | IndustrySolutionSection, SolutionListView, SolutionDetailView |
| `cases.js` | `CASES`, `CASE_INDUSTRIES` | CaseListView, CaseDetailView |
| `testimonials.js` | `TESTIMONIALS` | TestimonialSection |
| `logos.js` | `LOGO_ITEMS`, `LOGO_FILTERS` | LogoWallSection |
| `whyUs.js` | `WHY_US_TABS`, `STATS_BAR` | WhyUsSection |
| `resources.js` | `RESOURCES`, `RESOURCE_TYPES` | ResourceSection, ResourceListView, ResourceDetailView |
| `searchIndex.js` | `SEARCH_INDEX` | SearchModal |

---

## 7. 样式架构

### 7.1 CSS 变量注入策略

```
tokens/index.js（JS 常量，唯一真相来源）
         ↓ 手动同步
styles/global.css（:root { --primary: #1B5FEB; ... }）
         ↓ 被所有 *.module.css 通过 var(--token) 引用
```

> ⚠️ 规则：所有 `*.module.css` 中禁止出现硬编码色值（如 `#1B5FEB`），必须使用 `var(--primary)`。

### 7.2 全局样式职责

| 文件 | 职责 | 不应包含 |
|------|------|---------|
| `global.css` | `:root` CSS 变量 + Reset + body/a/img | 组件私有样式 |
| `animations.css` | 全部 `@keyframes` 定义 | 具体 class |
| `reveal.css` | `.reveal` / `.is-visible` / `.reveal-delay-N` | 其他样式 |
| `*.module.css` | 单组件私有样式，用 `var()` 引用 Token | 全局变量定义 |

### 7.3 CSS Modules 规范

```css
/* ✅ class 用 camelCase */
.heroSection { background: var(--grad-hero); }
.heroTitle { font-size: clamp(32px, 4.5vw, 60px); }

/* ✅ 响应式写在同一文件底部 */
@media (max-width: 767px) {
  .heroSection { padding: 80px 0 60px; }
}
```

---

## 8. 组件规范

### 8.1 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| Section 组件 | `[名称]Section` | `HeroSection` |
| 子组件 | 语义名称 | `ProductCard`, `TestimonialCard` |
| UI 原子 | 功能名 | `Button`, `Tag`, `SectionHeader` |
| Hook | `use[功能名]` | `useCarousel` |
| Context | `[名称]Context` | `ModalContext` |
| 数据常量 | 全大写 SNAKE_CASE | `PRODUCT_TABS` |

### 8.2 Props 规范

```vue
<!-- Section 组件：无 Props（数据从 data/ 直接 import） -->
<script setup>
function HeroSection() { /* ... */ }
</script>

<!-- 子组件：明确 Props -->
<script setup>
const props = defineProps({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  desc: { type: String, required: true },
  link: { type: String, default: '#' },
});
</script>
```

### 8.3 单文件行数限制

| 类型 | 上限 | 超出策略 |
|------|------|---------|
| Section 组件 | 150 行 | 拆子组件 |
| 子组件 | 80 行 | 提取 Hook |
| UI 原子组件 | 60 行 | 无需拆分 |
| CSS Module | 200 行 | 拆分 `@media` 块 |
| Hook | 100 行 | 拆分职责 |

---

## 9. 关键交互实现策略

### 9.1 导航滚动变色

```vue
<!-- NavBar.vue：通过 useNavScroll 返回 scrolled，
     用 :class="{ [styles.scrolled]: scrolled }" 动态切换 class -->
```

### 9.2 弹窗全局触发（任意组件调用）

```vue
<!-- 任意组件：通过 useModal 获取 openModal，无需 prop drilling -->
<script setup>
import { useModal } from '@/composables/useModal';
const { openModal } = useModal();
</script>
<template>
  <Button @click="openModal">预约演示</Button>
</template>
```

### 9.3 轮播 Resize 修复（BUG-02 根本性解决）

Vue 版本通过 `useCarousel` Composable 的 resize 监听，在宽度变化后用 `setCurrentIdx(prev => prev)` 触发 effect 重新读取 DOM 宽度并重算 `translateX`，彻底告别旧版中外部变量陈旧问题。

### 9.4 悬停暂停（BUG-03 根本性解决）

`useCarousel` 返回 `bindPauseEvents(el)` 函数，`TestimonialSection` 将轮播容器的 ref 传入，即可完成 `mouseenter` / `mouseleave` 绑定，并在组件卸载时自动解绑。

---

## 10. 构建与部署

### 10.1 `vite.config.js`

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue/')) return 'vue';
          if (id.includes('node_modules/vue-router/')) return 'vue-router';
          if (id.includes('node_modules/axios/')) return 'axios';
        }
      }
    }
  },
  server: { port: 3000 }
});
```

### 10.2 性能目标

| 指标 | 目标 | 工具 |
|------|------|------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| JS Bundle（vendor）| < 150KB gzip | Vite 构建报告 |
| JS Bundle（app）| < 80KB gzip | Vite 构建报告 |
| CSS Bundle | < 30KB gzip | Vite 构建报告 |

---

> 📌 **确认项**：
> 1. 技术栈：Vue 3.5 + Vite 8.0.14 + CSS Modules + Vue Router（无 TypeScript，无 UI 库）
> 2. 数据策略：营销门户纯静态 JS 常量；博客/论坛接入后端 NestJS API
> 3. 部署平台：Vercel 静态站 / Nginx / OSS+CDN

---

## 11. 后端架构（v2.6.0 新增）

### 11.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | Node.js | ≥ 20 | LTS |
| 框架 | NestJS | 11 | 模块化 + DI/IOC |
| ORM | Prisma | 6 | 类型安全 + 自动迁移 |
| 数据库 | PostgreSQL | 16 | 关系型 + JSONB |
| 缓存 | Redis | 7 | 会话/缓存/限流 |
| 搜索 | Meilisearch | — | 全文搜索 |
| 存储 | MinIO | — | S3 兼容对象存储 |
| 认证 | JWT + bcrypt | — | Access/Refresh Token 轮转 |

### 11.2 模块结构

```
talentpro-backend/apps/api/src/modules/
├── auth/          # 注册/登录/JWT/刷新/黑名单
├── user/          # 用户管理 + PII 加密
├── role/          # 角色与权限管理
├── workspace/     # 多租户 Workspace 管理
├── blog/          # 文章/分类/标签 CRUD
├── forum/         # 话题/回复/置顶/锁定
├── lead/          # 演示预约线索 + 状态流转
├── analytics/     # 页面浏览/事件/转化漏斗
├── cms/           # 首页板块动态配置
├── search/        # Meilisearch 搜索索引管理
├── media/         # 文件上传/MinIO 存储
├── notification/  # SSE 实时通知
├── mail/          # 邮件发送
├── ai/            # AI 服务集成
├── experiment/    # A/B 测试实验管理
├── export/        # 数据导出
├── download/      # 资源下载追踪
├── case/          # 客户案例
├── news/          # 新闻管理
├── careers/       # 招聘职位管理
├── about/         # 关于我们内容
├── system/        # 系统配置/IP 黑白名单
└── health/        # 健康检查端点
```

### 11.3 认证与权限流程

1. **注册**：`POST /auth/register` → bcrypt 哈希 → reCAPTCHA 校验 → 默认 `USER` 角色
2. **登录**：`POST /auth/login` → 验证密码 → 签发 accessToken（15m）+ refreshToken（7d）
3. **刷新**：`POST /auth/refresh` → 验证 refreshToken → 删除旧令牌 → 签发新令牌对
4. **登出**：`POST /auth/logout` → Access Token 写入 TokenBlacklist → 即时失效
5. **权限**：`@Roles('ADMIN', 'SUPER_ADMIN')` + `RolesGuard` → JWT 解码 → 角色校验
6. **细粒度权限**：`@Permissions('cms:write', 'user:read')` + `PermissionGuard` → 权限点校验
7. **IP 过滤**：`IpFilterGuard` → 请求 IP 匹配黑白名单 → 拦截/放行

### 11.4 权限体系

```
请求 → JwtAuthGuard（认证）→ ThrottlerGuard（限流）→ PermissionGuard（权限）→ IpFilterGuard（IP）→ 控制器
```

| Guard | 职责 | 顺序 |
|-------|------|------|
| JwtAuthGuard | 解析 JWT，注入 req.user | 1 |
| ThrottlerGuard | 按端点限流（默认 500/min，auth 10/min，search 30/min） | 2 |
| PermissionGuard | 校验 `@Permissions()` 声明 | 3 |
| IpFilterGuard | 校验 IP 黑白名单 | 4 |

### 11.5 多租户（Workspace）

- **WorkspaceInterceptor**：从 `req.user.workspaceId` 提取租户 ID，注入 AsyncLocalStorage
- **Prisma 扩展**：`softDeleteExtension` → `encryptionExtension` → `workspaceExtension`
- **数据隔离**：所有查询自动附加 `workspaceId` 过滤条件

### 11.6 缓存体系

- **Redis 客户端**：ioredis，通过 `REDIS_CLIENT` Token 注入
- **@Cacheable 装饰器**：`@Cacheable({ key, ttl })` 标记需要缓存的 GET 端点
- **CacheInterceptor**：全局拦截，自动读取/写入 Redis，支持 `CACHE_EVICT` 清除
- **CacheInterceptor 已全局注册**，CMS 公开 GET 接口自动受益

### 11.7 队列（BullMQ）

- **NotificationProcessor**：通知推送（attempts: 3 + exponential backoff）
- **SearchIndexProcessor**：Meilisearch 索引同步
- **LeadNurtureProcessor**：线索 nurture 自动化邮件
- 所有 Processor 配置 `@OnWorkerEvent('failed')` 记录死信

### 11.8 搜索（Meilisearch）

- **MeilisearchModule**：全局模块，封装 Meilisearch 客户端
- **SearchIndexListener**：内容变更时自动触发索引更新（EventEmitter）
- 支持博客文章、论坛话题、资源、客户案例的全文检索

### 11.9 PII 字段级加密

- **加密算法**：AES-256-GCM
- **密钥来源**：`PII_ENCRYPTION_KEY` 环境变量 → `JWT_SECRET` fallback（记录警告日志）
- **自动字段**：User.phone / User.email / DemoBooking.phone / DemoBooking.email
- **实现方式**：Prisma 扩展（`encryptionExtension`），读写自动加解密，业务代码无感知

### 11.10 SSE 实时通知

- **Redis Pub/Sub**：全局仅 1 个 `psubscribe('sse:notifications:*')` 连接
- **频道命名**：`sse:notifications:{userId}`
- **多实例支持**：Redis Pub/Sub 确保集群环境下消息广播

### 11.11 Sentry 错误监控

- **Sentry.init()**：`main.ts` bootstrap 时初始化（dsn 来自 `SENTRY_DSN`）
- **SentryInterceptor**：全局拦截器，catchError 中上报异常
- **上下文信息**：userId、url、method、body（脱敏，去掉 password）

---

## 12. Admin 后台架构（v2.6.0 新增）

### 12.1 技术栈

| 维度 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.5 |
| 构建 | Vite | 8 |
| UI 库 | Element Plus | 2.8 |
| 状态 | Pinia | 2.2 |
| 路由 | Vue Router | 4.4 |
| 图标 | @element-plus/icons-vue | 2.3 |

### 12.2 目录结构

```
talentpro-admin/
├── src/
│   ├── main.js              # createApp + Pinia + Router + ElementPlus
│   ├── App.vue
│   ├── router/
│   │   └── index.js         # 路由守卫（JWT 校验 + 权限拦截）
│   ├── stores/
│   │   ├── auth.js          # token + user + login/logout
│   │   └── permission.js    # 权限点缓存
│   ├── api/
│   │   └── client.js        # Axios + Bearer 拦截器 + 401 处理
│   └── views/
│       ├── LoginView.vue
│       ├── LayoutView.vue       # 侧边栏 + 顶部栏 + 标签页
│       ├── DashboardView.vue    # 数据仪表盘（图表库）
│       ├── BlogManagerView.vue  # 博客文章管理（富文本编辑器）
│       ├── ForumManagerView.vue # 论坛话题/回复管理
│       ├── AnalyticsView.vue    # 数据分析/埋点报表
│       ├── UsersView.vue        # 用户列表/角色分配
│       ├── LeadsView.vue        # 线索管理/跟进记录
│       ├── CmsManagerView.vue   # CMS 内容板块配置
│       ├── WorkspaceView.vue    # Workspace 租户管理
│       ├── SystemConfigView.vue # 系统参数/IP 黑白名单
│       ├── RoleManagerView.vue  # 角色与权限管理
│       ├── ExperimentView.vue   # A/B 实验管理
│       └── NotificationView.vue # 通知发送/历史
```

### 12.3 权限模型

- 登录页（`public`）：无需认证
- 所有后台页面：路由守卫检查 `auth.isLoggedIn` → 未登录跳转 `/login`
- API 请求：Axios 拦截器自动附加 `Authorization: Bearer ${token}`
- 401 响应：自动 logout + 跳转登录页

*架构师 Agent 产出 | 2026-03-15 | v3.0.0 更新 2026-05-28*
