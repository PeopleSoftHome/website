# TalentPro HR Portal — 测试计划

> **版本**：v4.3.0 | **负责角色**：测试专家 Agent
> **最后更新**：2026-06-19
> **状态**：已对齐当前 CI 流水线与代码基线

---

## 测试范围

### 功能测试项（按 Section / 页面）

| Section / 页面 | 测试要点 | 优先级 |
|---------|---------|-------|
| SEC-01 导航 | Mega 菜单展开/收起、滚动变色、移动端 Hamburger | P0 |
| SEC-02 Hero | CTA 按钮触发弹窗、视频按钮 | P0 |
| SEC-04 统计区 | Count-up 动画触发 | P1 |
| SEC-05 产品矩阵 | 4 Tab 切换正确 | P0 |
| SEC-06 AI 专区 | 卡片 hover 效果 | P1 |
| SEC-07 行业方案 | 5 Tab 切换 + 内容联动 | P0 |
| SEC-08 轮播 | 自动播放、手动切换、悬停暂停、resize 正确 | P0 |
| SEC-09 Logo 墙 | 行业筛选过滤功能 | P0 |
| SEC-10 为什么选我们 | 3 Tab 切换 | P0 |
| SEC-15 弹窗 | 3 步骤流程、表单验证、验证码倒计时 | P0 |
| 博客 / 论坛 | 列表加载、详情渲染、分页/筛选、评论 | P0 |
| 认证 | 登录/注册弹窗、JWT Cookie、Token 黑名单 | P0 |
| 案例 / 解决方案 / 资源 / 新闻 | 列表筛选、详情 fallback、JSON-LD | P1 |
| Marketplace | 应用列表/详情、购物车、Stripe 支付回调 | P1 |
| Admin 后台 | CRUD、权限、菜单、CMS 配置 | P1 |

### 响应式测试断点

| 断点 | 宽度 | 测试设备 |
|------|------|---------|
| Mobile S | 375px | iPhone SE |
| Tablet | 768px | iPad |
| Desktop S | 1024px | 小屏笔记本 |
| Desktop | 1440px | 标准桌面 |

### 跨浏览器测试

- Chrome 最新版
- Safari 最新版
- Firefox 最新版
- Edge 最新版

---

## 自动化测试矩阵

| 范围 | 工具 | 命令 | 当前基线 |
|------|------|------|---------|
| Portal 单元测试 | Vitest | `npm run test:run` | 29 files / 120 tests |
| Portal 覆盖率 | v8 (`vitest --coverage`) | `npm run test:cov` | statements ≥60%, branches ≥40%, functions ≥50%, lines ≥65% |
| Portal E2E | Playwright | `npx playwright test` | 8 specs（首页 / 博客 / 论坛 / 认证 / 搜索 / 主题 / 表单 / 无障碍） |
| Backend 单元测试 | Jest | `cd talentpro-backend && npm run test` | 18 suites / 143 tests |
| Backend 覆盖率 | Jest | `cd talentpro-backend && npm run test:cov` | 目标 ≥20%（当前约 16%，持续补充中） |
| Backend E2E | Jest | `cd talentpro-backend && npm run test:e2e` | 配置就绪 |
| Admin 构建 | Vite | `cd talentpro-admin && npm run build` | 构建成功 |

### 覆盖率阈值（Portal）

`vitest.config.ts` 已固化全局阈值，低于阈值时 CI 失败：

```ts
coverage: {
  thresholds: {
    global: {
      statements: 60,
      branches: 40,
      functions: 50,
      lines: 65,
    },
  },
}
```

> 阈值基于当前基线设置，后续随测试补充逐步提高。

---

## 手动验证清单（每次关键变更后）

**P0 — 核心流程**：

1. `npm run dev` / `npm run build` 无报错。
2. `npm run test:run`、`npm run test:cov`、`npx playwright test` 全部通过。
3. 首页 15 个 Section 可见，无白屏。
4. 导航下拉、Tab 切换、轮播、弹窗、全局搜索、暗色/多语言切换正常。
5. 博客/论坛/认证/案例/解决方案/资源/新闻/Marketplace 核心流程正常。
6. 后端 `/health` 返回 200，Swagger 可访问。

**P1 — 安全与性能**：

1. 生产 CSP 不允许 `'unsafe-inline'` / `'unsafe-eval'`。
2. Auth 接口限流生效（default 100/min，strict 50/min，auth 10/min）。
3. JWT 注销后 TokenBlacklist 拦截。
4. 依赖审计 `npm audit --audit-level=high` 为 0。

---

## 缺陷报告模板

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
