# Nuxt 3 完整迁移计划

> **基线 Commit**: `d626835` | **计划日期**: 2026-05-30
> **范围**: 前端营销门户（`src/` 目录）| **后端/Admin 不受影响**
> **目标**: 从 Vue 3 SPA + Vite 迁移至 Nuxt 3 SSR/SSG，提升 SEO 和首屏性能

---

## 一、迁移目标与验收标准

| 指标 | 当前（SPA） | 目标（Nuxt 3） | 验证方式 |
|------|------------|---------------|---------|
| LCP | ~2.8s | < 1.8s | Lighthouse CI |
| TTFB | ~600ms | < 200ms | WebPageTest |
| SEO 可索引性 | 中等（预渲染） | 优秀（服务端 HTML） | Google Search Console |
| 构建产物 | 静态 JS/CSS | 预渲染 HTML + Hydration | `npm run generate` |
| 首屏无 JS | ❌ | ✅（HTML 直出） | 关闭 JS 后页面可渲染 |

---

## 二、目录结构映射

### 当前 Vue 3 SPA 结构
```
src/
├── main.js                 # createApp + router + manifest-loader
├── App.vue                 # 全局 Provider + 弹窗挂载 + 错误边界
├── router/
│   ├── index.js            # 24 条路由声明
│   └── guards.js           # 认证守卫 + Meta 同步
├── pages/                  # 26 个页面组件
├── layouts/
│   └── DefaultLayout.vue   # 单一布局外壳
├── components/
│   ├── layout/             # NavBar + Footer
│   ├── sections/           # 15 个首页 Section
│   └── ui/                 # 19 个原子组件
├── composables/            # 22 个 Composables
├── stores/                 # 7 个工厂函数状态
├── api/                    # 18 个 API 模块
├── data/                   # 12 个静态数据文件
├── i18n/                   # 3 语言 JSON
├── styles/                 # global.css + animations.css + reveal.css
├── tokens/                 # Design Token JS
└── types/                  # TS 类型声明
```

### 目标 Nuxt 3 结构
```
├── nuxt.config.ts          # Nuxt 配置（SSR/SSG 模式、模块、RuntimeConfig）
├── app.vue                 # 根组件（替代 App.vue，简化）
├── pages/                  # 文件系统路由（Nuxt 约定）
│   ├── index.vue           # HomePage
│   ├── blog/
│   │   ├── index.vue       # BlogList
│   │   └── [slug].vue      # BlogDetail
│   ├── forum/
│   │   ├── index.vue
│   │   └── topic-[id].vue
│   ├── products/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── solutions/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── cases/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── resources/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── news/
│   │   ├── index.vue
│   │   └── [slug].vue
│   ├── careers/
│   │   ├── index.vue
│   │   ├── campus.vue
│   │   ├── social.vue
│   │   └── [id].vue
│   ├── about/
│   │   ├── index.vue
│   │   ├── team.vue
│   │   ├── contact.vue
│   │   └── partners.vue
│   ├── profile.vue
│   └── [...slug].vue       # 404 兜底
├── layouts/
│   └── default.vue         # 默认布局
├── components/             # 自动导入（目录结构保留）
│   ├── layout/
│   ├── sections/
│   └── ui/
├── composables/            # 自动导入（Nuxt 约定）
├── stores/                 # Pinia（Nuxt 官方推荐）
├── api/                    # 保留，但 client.ts 改为 $fetch
├── server/
│   ├── api/                # Nitro API Routes（可选：BFF 层）
│   └── middleware/         # 服务端中间件
├── data/                   # 静态数据（移至 public/ 或 composables）
├── i18n/                   # @nuxtjs/i18n 模块
├── assets/
│   └── css/
│       ├── global.css
│       ├── animations.css
│       └── reveal.css
├── public/                 # 静态资源（保留）
└── types/                  # TS 类型声明
```

---

## 三、迁移阶段（共 6 个迭代，每个迭代独立可回滚）

### 🔹 迭代 1：Nuxt 3 基础设施（1 周）
**Git Branch**: `feat/nuxt3-infra`

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| 安装 Nuxt 3 依赖 | `package.json` | 新增 `nuxt`, `@nuxtjs/i18n`, `@pinia/nuxt`, `@nuxtjs/google-fonts` |
| 创建 `nuxt.config.ts` | 新增 | SSR 模式、模块注册、RuntimeConfig、 Nitro 预设 |
| 创建 `app.vue` | 新增 | 根组件，保留全局 Provider 和弹窗挂载 |
| 删除旧入口 | 删除 `index.html`, `src/main.js` | Nuxt 自动生成 HTML |
| 适配 `vite.config.js` | 删除或合并到 `nuxt.config.ts` | PWA 插件、路径别名迁移 |
| 验证构建 | — | `npm run dev` 正常启动，`npm run build` 无报错 |

**回滚策略**: 回退到 `d626835`，恢复 `index.html` + `src/main.js` + `vite.config.js`

---

### 🔹 迭代 2：路由系统迁移（1 周）
**Git Branch**: `feat/nuxt3-routes`
**依赖**: 迭代 1

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| 删除 `src/router/` | 删除 `index.js`, `guards.js` | Nuxt 文件路由替代 |
| 迁移 24 条路由 | `src/pages/**/*.vue` → `pages/**/*.vue` | 按 Nuxt 文件路由约定重命名 |
| 动态路由适配 | `[slug].vue`, `[id].vue` | Vue Router `:slug` → Nuxt `[slug]` |
| 路由守卫迁移 | 新增 `middleware/auth.ts` | `router.beforeEach` → Nuxt Route Middleware |
| Meta 同步迁移 | 每个页面使用 `useHead()` | `watch(route.path)` → `useHead({ title, meta })` |
| 验证路由 | — | 访问 `/blog/test-slug` 正常渲染 |

**回滚策略**: 恢复 `src/router/` 目录，删除 `pages/` 中错误路由

---

### 🔹 迭代 3：布局 + 组件适配（1 周）
**Git Branch**: `feat/nuxt3-layouts`
**依赖**: 迭代 2

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| 迁移布局 | `src/layouts/DefaultLayout.vue` → `layouts/default.vue` | Nuxt 布局约定 |
| 组件自动导入 | 删除手动 import | Nuxt 自动扫描 `components/` 目录 |
| SSR 安全处理 | 修改 `NavBar.vue`, `Footer.vue` | `onMounted` 中访问 `window/document` |
| IconSprite 全局挂载 | 移至 `app.vue` | Nuxt 插件或 `app.vue` 模板层 |
| 验证布局 | — | 所有页面正确套用 default layout |

**回滚策略**: 恢复手动 import，回退布局文件路径

---

### 🔹 迭代 4：数据获取 + API 适配（1.5 周）
**Git Branch**: `feat/nuxt3-data-fetching`
**依赖**: 迭代 3

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| 替换 Axios | `src/api/client.ts` → `$fetch` | Nuxt 内置 `ofetch`，SSR 友好 |
| 迁移 `useCmsData` | 修改 `composables/useCmsData.ts` | `import()` fallback → `useAsyncData()` + `useFetch()` |
| 迁移 `useApiData` | 修改 `composables/useApiData.ts` | 支持 SSR 数据预取 |
| 首页 Section 数据 | `pages/index.vue` | `useAsyncData('cms-home', () => $fetch('/api/v1/cms/home'))` |
| 详情页数据 | `pages/blog/[slug].vue` | `useAsyncData('blog-' + slug, () => $fetch(...))` |
| 静态 fallback | `composables/useStaticFallback.ts` | Nuxt 服务端失败时自动降级 |
| 验证 SSR 数据 | — | 查看页面源码，确认 HTML 中包含内容 |

**回滚策略**: 恢复 Axios client，回退 `useCmsData` 到 `import()` 模式

---

### 🔹 迭代 5：状态管理 + i18n + PWA（1.5 周）
**Git Branch**: `feat/nuxt3-state-i18n`
**依赖**: 迭代 4

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| 替换状态管理 | `stores/*.js` → Pinia Stores | `provide/inject` → `@pinia/nuxt` |
| 迁移 i18n | `@nuxtjs/i18n` 模块 | 自研 i18n → Nuxt i18n，支持 SSR locale |
| hreflang 标签 | `useHead()` 自动生成 | Nuxt i18n 自动处理 |
| PWA 迁移 | `@vite-pwa/nuxt` | `vite-plugin-pwa` → Nuxt PWA 模块 |
| Cookie 同意 | `useCookieConsent.ts` | 适配 SSR（Cookie 在服务端可读） |
| 验证状态 | — | 切换语言/主题后刷新页面，状态保持 |

**回滚策略**: 恢复自研 stores 和 i18n，移除 Pinia/i18n 模块

---

### 🔹 迭代 6：构建优化 + 部署适配（1 周）
**Git Branch**: `feat/nuxt3-build-deploy`
**依赖**: 迭代 5

| 任务 | 文件操作 | 说明 |
|------|---------|------|
| Nitro 预设配置 | `nuxt.config.ts` | `nitro: { preset: 'node-server' }` 或 `'static'` |
| SSG 生成 | `nuxt.config.ts` | `ssr: true`, `nitro.prerender.routes` 配置预渲染路由 |
| 图片优化 | `@nuxt/image` | 替换 `<img>` 为 `<NuxtImg>`，自动优化 |
| Font 优化 | `@nuxtjs/google-fonts` | 构建时自动下载字体，内联 CSS |
| CI/CD 更新 | `.github/workflows/ci.yml` | 构建命令 `nuxt build` / `nuxt generate` |
| Docker 更新 | `docker/Dockerfile` | 多阶段构建：Node → Nuxt → Nginx |
| 性能基准测试 | Lighthouse CI | LCP < 1.8s, TTFB < 200ms |

**回滚策略**: 恢复 Vite SPA 构建流程，Nuxt 产物不部署

---

## 四、关键改造详解

### 4.1 Axios → `$fetch` 迁移

**当前**:
```js
// src/api/client.ts
import axios from 'axios';
export const apiClient = axios.create({ baseURL, timeout });
```

**目标**:
```ts
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  
  return $fetch.create({
    baseURL,
    credentials: 'include',
    onRequest({ options }) {
      // Cookie 自动携带，无需手动设置 header
    },
    onResponseError({ response }) {
      if (response.status === 401) { /* 刷新逻辑 */ }
    },
  });
};
```

### 4.2 数据获取：`useCmsData` → `useAsyncData`

**当前**:
```js
const { items, loading } = useCmsData('products', fallbackProducts);
```

**目标**:
```vue
<script setup>
const { data: products, pending } = await useAsyncData('cms-products', () =>
  $fetch('/api/v1/cms/products'),
  { default: () => fallbackProducts }
);
</script>
```

### 4.3 路由守卫迁移

**当前**:
```js
// router/guards.js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    authOpen.value = true;
    next(false);
  }
});
```

**目标**:
```ts
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return navigateTo('/?auth=required', { replace: true });
  }
});
```

### 4.4 SSR 安全清单

| 场景 | 处理方案 |
|------|---------|
| `window` / `document` | 移至 `onMounted` 或 `process.client` |
| `localStorage` | 使用 `useCookie()` 替代，或延迟到客户端 |
| `IntersectionObserver` | `onMounted` 中初始化 |
| `navigator.sendBeacon` | `onMounted` 或 `onBeforeUnmount` |
| `import.meta.glob` | 移至 `plugins/` 或使用 `useFetch` |
| 动态组件 `defineAsyncComponent` | Nuxt 自动处理，无需改动 |

---

## 五、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 第三方库 SSR 不兼容 | 中 | 高 | 使用 `<ClientOnly>` 包裹，或寻找替代库 |
| 构建产物体积增大 | 中 | 中 | Nitro Tree Shaking + 动态导入非关键模块 |
| 部署复杂度上升 | 高 | 中 | 保留静态生成能力（`nuxt generate`），可回退到 SPA 部署 |
| i18n SEO 回归 | 低 | 高 | `@nuxtjs/i18n` 自动生成 `hreflang`，部署后验证 Search Console |
| 开发环境启动变慢 | 中 | 低 | 使用 `ssr: false` 本地开发模式，仅构建时启用 SSR |

---

## 六、时间线汇总

| 迭代 | 内容 | 周期 | 累计 |
|------|------|------|------|
| 迭代 1 | 基础设施 | 1 周 | 1 周 |
| 迭代 2 | 路由系统 | 1 周 | 2 周 |
| 迭代 3 | 布局 + 组件 | 1 周 | 3 周 |
| 迭代 4 | 数据获取 + API | 1.5 周 | 4.5 周 |
| 迭代 5 | 状态 + i18n + PWA | 1.5 周 | 6 周 |
| 迭代 6 | 构建 + 部署 | 1 周 | **7 周** |

**建议**：按迭代逐步推进，每个迭代完成后做 git tag（`nuxt3-iter-1` 至 `nuxt3-iter-6`），确保可随时回滚到任意阶段。

---

## 七、即刻可执行的决策点

1. **是否保留 SPA 开发模式？** 建议本地开发 `ssr: false`，仅 CI 构建时启用 SSR，减少开发摩擦
2. **Nitro 预设选择？** 推荐先 `preset: 'static'`（SSG），验证稳定后切 `node-server`（SSR）
3. **是否引入 BFF 层？** 建议暂不引入，保持后端 API 独立，Nuxt `server/api/` 仅用于代理/聚合

---

*计划完成，等待确认后按迭代执行。每个迭代独立 git branch + PR + review + merge。*
