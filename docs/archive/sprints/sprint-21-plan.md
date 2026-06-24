# Sprint 21 计划 — v3.1.0 运营增强与性能极致化

> **状态**: 📋 待 PO 评审  
> **周期**: 2 周（建议 2026-06-02 ~ 2026-06-15）  
> **目标**: 补齐运营最后一公里（媒体上传 + Dashboard 实时化），前端性能冲击 Lighthouse 100  
> **涉及模块**: Admin 媒体库 / Dashboard / 前端性能 / 文档

---

## 一、背景与动机

v3.0.0 完成了安全架构、CMS 动态化、Workspace 隔离等核心基础设施。当前项目状态：

| 维度 | 状态 |
|------|------|
| 前后端构建 | ✅ 全绿 |
| 前后端测试 | ✅ 164/164 通过（前端 117 + 后端 47）|
| E2E | ✅ 17/17 通过 |
| 安全漏洞 | ✅ 0 高危 |
| JSON-LD | ✅ 24 个页面全部覆盖 |
| 技术债（P0~P1）| ✅ 清零 |

v3.1.0 转向**运营可用性**和**性能极致化**：
- 运营团队无法在 Admin 直接上传图片到媒体库（只能手动填 URL）
- Dashboard 数据是静态 mock，无法反映实时业务状态
- Lighthouse Performance 卡在 90 左右，需冲击 95+

---

## 二、任务清单

### 模块 A：Admin 媒体库文件上传（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T21-A1 | 后端 `POST /medias/upload` 文件上传端点 | Multer + 本地存储/OSS 适配 | 4h |
| T21-A2 | 前端 `MediaView` 集成 `el-upload` | 拖拽上传、进度条、预览 | 3h |
| T21-A3 | 上传图片自动生成缩略图 | Sharp 处理，生成 `thumb_url` | 3h |
| T21-A4 | 环境变量配置 `STORAGE_TYPE` / `OSS_*` | 支持 local / aliyun / s3 | 2h |

**验收标准**:
- [ ] Admin 媒体库页面支持拖拽上传图片
- [ ] 上传后自动生成缩略图，列表显示 60x60 预览
- [ ] 支持配置本地存储或云存储（OSS/S3）
- [ ] 文件大小限制 10MB，类型限制 image/*

---

### 模块 B：Dashboard 实时数据（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T21-B1 | 后端 `GET /admin/dashboard/stats` 聚合 API | 今日线索/本月线索/总用户/待跟进 | 3h |
| T21-B2 | 后端 `GET /admin/dashboard/lead-trend` 趋势 API | 最近 7 天每日线索数 | 2h |
| T21-B3 | 前端 DashboardView 接入真实 API | 替换 mock 数据 | 2h |
| T21-B4 | 数据自动刷新（5 分钟轮询）| `setInterval` + 组件卸载清理 | 1h |

**验收标准**:
- [ ] Dashboard 4 个统计卡片显示真实数据
- [ ] 折线图显示最近 7 天线索趋势
- [ ] 数据每 5 分钟自动刷新
- [ ] 后端 API 受 ADMIN 角色保护

---

### 模块 C：前端性能极致化（P2）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T21-C1 | 图片 WebP 化 + fallback | `<picture>` 标签，支持 webp/jpg | 3h |
| T21-C2 | 路由级代码分割优化 | 非首屏页面全部 `defineAsyncComponent` | 2h |
| T21-C3 | `loading="lazy"` 全量补全 | 所有 `<img>` 添加原生懒加载 | 1h |
| T21-C4 | Lighthouse CI 集成 | GitHub Actions 中运行 Lighthouse | 2h |

**验收标准**:
- [ ] Lighthouse Performance ≥ 95
- [ ] LCP < 2.0s
- [ ] CLS < 0.05
- [ ] CI 中自动运行 Lighthouse，低于 90 阻断合并

---

### 模块 D：文档同步（P2）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T21-D1 | 重写 `docs/prd.md` 为 v3.0.0 状态 | 补全 CMS / Workspace / 安全章节 | 3h |
| T21-D2 | 重写 `docs/architecture.md` 为 v3.0.0 状态 | 组件树、数据流、部署图 | 3h |
| T21-D3 | 更新 `docs/admin-backend-audit-report.md` | 标记全部 P0~P2 为已修复 | 1h |
| T21-D4 | 更新 `CHANGELOG.md` v3.1.0 章节 | 记录 Sprint 21 变更 | 1h |

---

## 三、技术方案

### 文件上传

```typescript
// media.controller.ts 新增
@Post('upload')
@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
upload(@UploadedFile() file: Express.Multer.File) {
  // 根据 STORAGE_TYPE 分发到 local / oss / s3
}
```

### Dashboard 聚合查询

```typescript
// dashboard.controller.ts
@Get('stats')
async getStats() {
  const [todayLeads, monthLeads, totalUsers, pendingFollowUps] = await Promise.all([
    this.leadService.countToday(),
    this.leadService.countThisMonth(),
    this.userService.count(),
    this.leadService.countPending(),
  ]);
  return { todayLeads, monthLeads, totalUsers, pendingFollowUps };
}
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

---

## 四、验收标准（DoD）

### 功能验收
- [ ] Admin 媒体库支持上传图片，列表实时刷新
- [ ] Dashboard 显示真实业务数据，趋势图正常
- [ ] 首页 Lighthouse Performance ≥ 95

### 代码质量
- [ ] 新增文件 < 150 行（超出拆分子组件）
- [ ] 所有颜色使用 `var(--token)`，无硬编码
- [ ] 新增 API 含 Swagger 文档
- [ ] 新增功能含单元测试覆盖

### 回归测试
- [ ] `npm run test:run` 117/117 通过
- [ ] `npx playwright test` 17/17 通过
- [ ] `npm run build` 构建成功，无 warning
- [ ] `cd talentpro-backend && npm run test` 47/47 通过

---

## 五、风险与依赖

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Multer 上传大文件内存溢出 | 低 | 中 | 使用 `diskStorage`，限制 10MB |
| OSS 配置缺失导致上传失败 | 中 | 低 | 默认降级到本地存储，开发环境可用 |
| Lighthouse CI 在 GitHub Actions 中不稳定 | 中 | 低 | 允许 ±3 分浮动，不阻断合并 |

---

*项目经理 Agent 产出 | Sprint 21 计划 | 2026-05-29*
