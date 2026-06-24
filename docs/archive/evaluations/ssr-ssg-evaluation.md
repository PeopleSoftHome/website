# SSR / SSG 技术方案评估报告

> **评估日期**: 2026-05-30 | **评估人**: 架构诊断团队
> **背景**: 当前为 Vue 3 SPA，营销门户 SEO 和首屏性能存在优化空间

---

## 一、现状分析

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| LCP | ~2.8s（依赖实际部署） | < 2.5s |
| TTFB | ~600ms（纯 API 调用） | < 200ms |
| SEO 可索引性 | 中等（依赖 prerender.js） | 优秀 |
| 构建产物 | 静态 HTML + JS Bundle | — |

**SPA 模式的 SEO 短板**:
- 搜索引擎爬虫对 JS 渲染的支持仍不完善（尤其百度）
- `prerender.js` 预渲染方案维护成本高，无法覆盖所有动态路由
- 社交分享（Open Graph）需要服务端确定 meta 标签

---

## 二、候选方案对比

### 2.1 Nuxt 3（Vue 生态 SSR/SSG 首选）

| 维度 | 评估 |
|------|------|
| **迁移成本** | ⭐⭐⭐☆☆ 中。当前组件可复用，但需适配 Nuxt 目录结构、路由约定、数据获取方式（`useFetch`/`useAsyncData`） |
| **SEO 收益** | ⭐⭐⭐⭐⭐ 高。完整的 SSR + 自动生成 sitemap + Open Graph 支持 |
| **首屏性能** | ⭐⭐⭐⭐⭐ 高。服务端渲染首屏 HTML，TTFB 显著降低 |
| **开发体验** | ⭐⭐⭐⭐⭐ 优秀。Vue 官方方案，生态成熟，TypeScript 支持完善 |
| **构建复杂度** | ⭐⭐⭐☆☆ 中。需配置 Nitro 服务端适配器，部署形态从静态变为 Node/Docker |
| **当前适配度** | ⭐⭐⭐⭐☆ 高。当前为 Vue 3 + Vue Router，组件层零改动迁移 |

**关键改造点**:
- `src/pages/*.vue` → `pages/*.vue`（Nuxt 文件路由）
- `src/router/index.js` → 删除（Nuxt 自动路由）
- `useCmsData` 中的 `import()` fallback → `useAsyncData` + server API
- 部署从静态 CDN → Node.js 服务端（或混合 SSG）

**推荐场景**: 若团队计划长期深耕 Vue 生态，Nuxt 是最自然的演进路径。

### 2.2 Astro（静态站点生成器， Islands 架构）

| 维度 | 评估 |
|------|------|
| **迁移成本** | ⭐⭐☆☆☆ 高。需将 Vue 组件重构为 Astro 组件 + Islands，JS 框架仅用于交互区域 |
| **SEO 收益** | ⭐⭐⭐⭐⭐ 高。纯 HTML 输出，零 JS 也能完美索引 |
| **首屏性能** | ⭐⭐⭐⭐⭐ 极高。默认 0 JS，仅 hydration 交互区域 |
| **开发体验** | ⭐⭐⭐⭐☆ 良好。 Islands 架构先进，但团队需学习新范式 |
| **构建复杂度** | ⭐⭐⭐⭐⭐ 低。纯静态构建，可直接部署到 CDN |
| **当前适配度** | ⭐⭐☆☆☆ 低。15 个 Section 中大部分为静态展示，但 Tab 切换/轮播/弹窗等交互需 Islands 化 |

**关键改造点**:
- 首页 15 个 Section 中 80% 可转为纯静态 Astro 组件
- 交互区域（TabNav、Carousel、DemoModal）保留 Vue Islands
- CMS 数据在构建时通过 `getStaticPaths` / `getStaticProps` 拉取

**推荐场景**: 若团队追求极致的首屏性能和静态化，且能接受多框架并存。

### 2.3 当前方案增强（SPA + 预渲染 + Edge SSR）

| 维度 | 评估 |
|------|------|
| **迁移成本** | ⭐⭐⭐⭐⭐ 极低。无需改动架构 |
| **SEO 收益** | ⭐⭐⭐☆☆ 中。`prerender.js` 已覆盖首页，二级页面可扩展 |
| **首屏性能** | ⭐⭐⭐☆☆ 中。可通过 CDN Edge SSR（Cloudflare Workers / Vercel Edge）注入首屏 HTML |
| **开发体验** | ⭐⭐⭐⭐⭐ 无变化 |
| **构建复杂度** | ⭐⭐⭐⭐⭐ 无变化 |
| **当前适配度** | ⭐⭐⭐⭐⭐ 完全适配 |

**增强措施**:
1. **Edge SSR**: 使用 Cloudflare Workers 或 Vercel Edge 对首页和关键页面做边缘渲染
2. **动态渲染**: 对搜索引擎爬虫返回预渲染 HTML，对用户返回正常 SPA
3. **改进 prerender.js**: 扩展预渲染路由覆盖范围（所有 `/products/:slug`, `/solutions/:slug` 等）

---

## 三、决策建议

| 优先级 | 方案 | 条件 | 时间预估 |
|--------|------|------|---------|
| **P1** | **Nuxt 3 迁移** | 团队有 2-3 个月专项时间，且计划长期维护 | 2-3 个月 |
| **P2** | **当前方案 + Edge SSR** | 资源紧张，需快速见效 | 2-3 周 |
| **P3** | **Astro 迁移** | 追求极致性能，团队接受学习成本 | 3-4 个月 |

**推荐路线**：
1. **短期（1-2 个月）**：增强当前 `prerender.js`，覆盖所有 SEO 敏感路由；接入 Cloudflare Workers 做首页 Edge SSR
2. **中期（3-6 个月）**：评估 Nuxt 3 迁移可行性，从博客/新闻等低交互页面开始试点
3. **长期（6-12 个月）**：完整迁移至 Nuxt 3，获得完整的 SSR + API Routes + 自动优化能力

---

*评估完成于 2026-05-30*
