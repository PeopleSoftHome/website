# Sprint 25 计划 — v3.5.0 性能极致化与工程化完善

> **状态**: 📋 执行中  
> **周期**: 1 周（建议 2026-07-06 ~ 2026-07-13）  
> **目标**: 前端包体积可视化分析，API 缓存优化，环境变量文档完善  
> **涉及模块**: 构建优化 / 后端缓存 / 文档

---

## 一、任务清单

### 模块 A：前端 Bundle 分析（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T25-A1 | 安装 `rollup-plugin-visualizer` | 分析包体积分布 | 0.5h |
| T25-A2 | `vite.config.js` 集成 visualizer | `npm run analyze` 命令 | 0.5h |
| T25-A3 | `index.html` 资源预连接优化 | `preconnect` Google Fonts + API | 0.5h |

### 模块 B：后端 API 缓存优化（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T25-B1 | CMS 公开接口添加 `Cache-Control` | `public, max-age=300` | 1h |
| T25-B2 | 媒体文件接口添加 `Cache-Control` | `public, max-age=86400` | 0.5h |

### 模块 C：环境变量文档完善（P2）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T25-C1 | 重写 `.env.example` | 前端 + 后端 + Admin 完整变量说明 | 1h |
| T25-C2 | 重写 `talentpro-backend/.env.example` | 数据库/Redis/JWT/邮件/存储等 | 1h |

---

## 二、验收标准

- [ ] `npm run analyze` 生成可视化包体积报告
- [ ] CMS 公开接口响应头含 `Cache-Control`
- [ ] `.env.example` 覆盖全部必要环境变量
- [ ] 前后端构建 + 测试全部通过

---

*项目经理 Agent 产出 | Sprint 25 计划 | 2026-05-29*
