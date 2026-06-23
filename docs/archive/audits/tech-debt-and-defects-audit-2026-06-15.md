# TalentPro 缺陷与技术债全面走查报告

> **走查时间**：2026-06-15  
> **范围**：前端营销门户 + NestJS 后端 + Admin 后台 + 工程化配置  
> **方法**：文档审阅 + 静态扫描 + lint/audit + 构建产物检查 + 代码走查  

---

## 一、迭代机会评估

### 1.1 已规划 Sprint 的当前状态

| Sprint | 主题 | 实现度 | 说明 |
|--------|------|--------|------|
| Sprint 7-9 | 产品/方案/案例/资源等二级页面 | ✅ 已完成 | E2E 已覆盖 |
| Sprint 10 | Hero 视频弹窗 | ✅ 已完成 | `VideoModal` 已存在 |
| Sprint 11a/b | i18n + 暗色模式 | ✅ 已完成 | 三语言 + 主题切换 |
| Sprint 12 | 全局搜索 | ✅ 已完成 | Cmd+K + 搜索弹窗 |
| Sprint 13 | v2.3.1 Bug 修复 | ✅ 已完成 | reveal / 下拉 / 轮播等 |
| Sprint 14-16 | ROI/Cookie/A&B/SEO/PWA/性能 | ✅ 大部分已完成 | JSON-LD 已覆盖，PWA 已配置 |
| Sprint 17-20 | Vue3 迁移 / CMS / 安全架构 | ✅ 已完成 | Nuxt 3 + Prisma 扩展链 |
| Sprint 21 | 媒体上传 + Dashboard + Lighthouse CI | ✅ 已完成 | Admin 可上传，Lighthouse CI 已配 |
| Sprint 22 | WebP + Prisma 迁移 + 文档 | ⚠️ 部分完成 | WebP/缩略图已生成，复合唯一索引已加，但前端 `@font-face` 缺失 |
| Sprint 23 | PWA 离线 + 错误边界 + E2E | ⚠️ 部分完成 | `offline.html` 与导航回退已配，**缺少 Vue ErrorBoundary** |
| Sprint 24 | 后端测试 + husky + i18n | ⚠️ 部分完成 | husky 已配置，但**后端 lint 未通过** |
| Sprint 25 | Bundle 分析 + 后端缓存 + env 文档 | ⚠️ 部分完成 | `npm run analyze` 已存在，**后端 `Cache-Control` 未全局落地**；Admin 无 `.env.example` |

### 1.2 结论：是否还有高价值功能迭代？

**不存在未完成的“高价值功能 Sprint”**。当前产品功能矩阵（营销门户 + Admin + 后端 API）已完整。后续投入回报率最高的方向是：

1. **修复运行时缺陷**（ChatBot AI 流式对话失效、字体未加载）
2. **修复工程化红线**（后端 lint 失败、Admin lint 脚本损坏）
3. **补齐稳定性与可观测性**（ErrorBoundary、后端测试覆盖、限流/缓存调优）

---

## 二、缺陷清单

### 2.1 P0 — 阻塞 CI 或运行时功能失效

| ID | 缺陷 | 位置 | 影响 | 修复建议 |
|----|------|------|------|----------|
| **D-P0-01** | 后端 lint 失败 | `talentpro-backend` | CI 中 `npm run lint` 会失败（46 errors / 292 warnings），合并阻塞 | 修复 `system.controller.ts` / `workspace.service.spec.ts` 等未使用导入；逐步消除 `any` |
| **D-P0-02** | Admin lint 脚本损坏 | `talentpro-admin/package.json` | `npm run lint` 报 "all files ignored"；pre-commit 遇到 Admin 文件修改会失败 | 升级 ESLint flat config 或改为 `eslint src --ext ...` 并新增 `eslint.config.mjs` |
| **D-P0-03** | ChatBot AI 流式对话协议不匹配 | `src/composables/useChatBot.js:101` | 前端仍用 `GET /ai/chat-stream?message=`，后端已改为 `POST /ai/chat-stream` + reCAPTCHA；且未 import `API_BASE_URL` | 改为 `fetch`/`ReadableStream` 消费 POST SSE，或新增兼容 SSE 端点；补 `import { API_BASE_URL }` |
| **D-P0-04** | NotoSansSC 子集字体未加载 | `public/fonts/*.woff2` | 生成/放置了 5 个 woff2 文件，但 `global.css` 无 `@font-face`，`nuxt.config.ts` 无 preload，浏览器实际使用系统字体回退 | 在 `global.css` 添加 `@font-face` 并设置 `font-display: swap`；在 `nuxt.config.ts` head 中 `preload` 关键字体 |

### 2.2 P1 — 明显体验或质量风险

| ID | 缺陷 | 位置 | 影响 | 修复建议 |
|----|------|------|------|----------|
| **D-P1-01** | `useScrollProgress.js` 是死代码 | `src/composables/useScrollProgress.js` | 无任何页面/组件引用，却参与构建与 lint | 删除或接入到需要滚动进度条的页面 |
| **D-P1-02** | 缺少 Vue ErrorBoundary | `src/App.vue` | 组件错误可能导致白屏；Sprint 23 已规划但未实现 | 新增 `ErrorBoundary.vue` 包裹 `<NuxtPage />` |
| **D-P1-03** | Admin 无 `.env.example` | `talentpro-admin/` | 新成员不知如何配置 `VITE_API_BASE_URL` 等变量 | 新增 `talentpro-admin/.env.example` |
| **D-P1-04** | 后端 `Cache-Control` 未统一 | CMS/媒体公开接口 | Sprint 25 要求 CMS 公开接口 `max-age=300`、媒体 `max-age=86400`，当前仅 Nitro 静态资源有规则 | 在 NestJS 响应拦截器或 Controller 上补充 `Cache-Control` |
| **D-P1-05** | `chunkSizeWarningLimit: 500` 过高 | `nuxt.config.ts:153` | 无法有效监控包体积膨胀 | 降至 150~200；增加 `npm run analyze` 到 CI artifact |
| **D-P1-06** | 后端本地测试难以运行 | `talentpro-backend` | `npm run test` 在无 PostgreSQL/Redis 时挂起/超时 | 提供 `docker-compose` 一键测试环境或增加 `test:unit` 仅跑无 DB 测试 |

### 2.3 P2 — 优化项

| ID | 缺陷 | 位置 | 影响 | 修复建议 |
|----|------|------|------|----------|
| **D-P2-01** | 前端 `esbuild/vite` 传递依赖高危漏洞 | `package-lock.json` | `npm audit` 报 9 个 high（esbuild 任意文件读取/RCE） | 关注 `@nuxtjs/i18n` / Nuxt 上游修复；必要时 pin 安全版本 |
| **D-P2-02** | `global.css` 未声明 `font-display` | 字体回退链 | 首次渲染可能出现 FOUT/FOIT | 配合 `@font-face` 一并添加 `font-display: swap` |
| **D-P2-03** | 后端存在大量 `any` 与未使用导入 | 46 errors / 292 warnings | 长期类型安全与维护成本上升 | 分模块开启 `@typescript-eslint/no-explicit-any` 修复 |

---

## 三、技术债清单

| ID | 债务项 | 当前状态 | 风险 | 建议 |
|----|--------|----------|------|------|
| **TD-01** | 前端无 TypeScript | 333 个文件纯 JS | 重构时类型缺失导致回归 | 优先迁移 `src/api/`、`src/stores/`、`src/composables/` |
| **TD-02** | 测试覆盖缺口 | 多个后端模块（Role/Cms/Search/Notification/System/Experiment 等）无测试；前端 `useRoiCalculator/useRum/useChatBot/useCmsData` 等无测试 | 重构信心低 | 为核心模块补单元测试，CI 设置覆盖率阈值 |
| **TD-03** | Token 双源同步 | `src/tokens/index.js` ↔ `src/styles/global.css` 手动同步 | 新增 Token 后 CSS 遗漏 | 构建时脚本校验或自动生成 CSS 变量 |
| **TD-04** | 前端数据文件膨胀 | `src/data/products.js` / `industries.js` 等较大 | 维护困难 | 考虑按 Tab/行业拆分子模块，或迁移到 CMS API |
| **TD-05** | Admin 与门户两套组件体系 | Admin 用 Element Plus，门户自研 | 长期视觉/交互一致性维护成本高 | 评估统一设计系统或提取共享基础组件 |
| **TD-06** | JWT 存储在 localStorage | `src/stores/auth.js` / `client.js` | XSS 可窃取 token | 评估 httpOnly cookie + CSRF 防护方案 |
| **TD-07** | Redis/Meilisearch 单点 | 生产配置未体现集群 | 高可用风险 | 文档化 Redis Sentinel/Cluster 与 Meilisearch 主从方案 |
| **TD-08** | 限流规则偏宽松 | 全局 500/min | DDoS 防护不足 | 增加 IP 级严格限流，关键表单接入验证码 |

---

## 四、已修复问题（本次走查中即时处理）

| 问题 | 文件 | 修复内容 |
|------|------|----------|
| 前端 lint 失败 | `src/composables/useScrollProgress.js` / `useSpyScroll.js` | 补充 `import { ref, computed, onMounted, onUnmounted } from 'vue'`，`npm run lint` 现已通过 |

---

## 五、优先级建议

### 本周可做（低风险、高回报）

1. **修复 ChatBot AI 流式对话**（D-P0-03）— 直接影响在线客服功能。
2. **加载 NotoSansSC 子集字体**（D-P0-04）— 明显提升中文排版与 Lighthouse 字体分。
3. **修复后端 lint**（D-P0-01）— 解除 CI 阻塞。
4. **修复 Admin lint 脚本**（D-P0-02）— 恢复 pre-commit 对 Admin 的校验。
5. **新增 Admin `.env.example`**（D-P1-03）。

### 下个月规划

1. 接入 Vue ErrorBoundary（D-P1-02）。
2. 统一后端公开接口 `Cache-Control`（D-P1-04）。
3. 补充缺失的前后端测试（TD-02）。
4. 清理死代码 `useScrollProgress.js`（D-P1-01）。
5. 关注并升级 esbuild/vite 传递依赖漏洞（D-P2-01）。

### 季度架构债

1. 渐进式 TypeScript 迁移（TD-01）。
2. JWT 存储方案评估（TD-06）。
3. Redis/Meilisearch 高可用配置落地（TD-07）。
4. 限流与验证码加固（TD-08）。

---

## 六、验证命令速查

```bash
# 前端
npm run lint          # 已通过
npm run build         # 通过，仅 sourcemap 插件 warning
npm audit             # 9 high（esbuild/vite 传递依赖）
npm run test:run      # 113/113 通过
npx playwright test --workers=4   # 285/285 通过

# 后端
cd talentpro-backend
npm run lint          # 46 errors / 292 warnings ❌
npm audit             # 0 vulnerabilities ✅
npm run test          # 需要 PostgreSQL/Redis，否则挂起

# Admin
cd talentpro-admin
npm run lint          # 脚本损坏 ❌
```

---

*报告生成时间：2026-06-15 | 基于代码库当前 HEAD 与静态扫描*
