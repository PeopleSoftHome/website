# TalentPro Admin 后台 & 全栈体系审查报告

> **审查日期**: 2026-05-28  
> **审查范围**: `talentpro-admin/` 前端 + `talentpro-backend/` 后端 API + `docs/` 设计文档 + 营销门户前端数据层  
> **审查方法**: 多 Agent 并行代码深度检视 + 文档对照 + 运行时验证  

---

## 执行摘要

本次审查发现 **Admin 后台处于 MVP（最小可行产品）级别**，与后端 NestJS 强大的 API 能力之间存在严重的**功能不对等**。后端已具备 20+ 个管理模块的完整 CRUD API，但 Admin 前端仅对接了约 6-7 个模块，且其中一半为只读或基础版本。

**核心结论**: Admin 后台目前只能算"线索+博客+论坛"的轻量管理台，距离一个成熟的 SaaS 运营后台（支持 CMS 动态化、多租户管理、细粒度权限、系统运维）还有显著差距。

### 风险矩阵

| 风险项 | 级别 | 影响 |
|--------|------|------|
| CMS内容无法后台维护，运营需改代码上线 | 🔴 P0 | 交付阻塞 |
| 多租户`User.email`全局唯一，无法支持一人多Workspace | 🔴 P0 | SaaS核心场景阻塞 |
| 权限系统未落地，低权限用户可看到所有菜单和按钮 | 🔴 P0 | 安全风险 |
| `findUnique`跨租户查询+部分模型未纳入Workspace过滤 | 🟡 P1 | 数据泄漏风险 |
| Token刷新逻辑调用不存在的方法 | 🟡 P1 | 用户体验/稳定性 |
| 营销门户仍读静态JS常量，CMS动态化未落地 | 🟡 P1 | 配置性缺失 |
| 无IP黑白名单 | 🟡 P1 | 运维安全 |
| PRD与架构文档严重滞后 | 🟢 P2 | 维护成本 |

---

## 一、Admin 前端功能覆盖度审查

### 1.1 现有页面清单（13个视图）

| 路由 | 视图 | 功能 | 完整度 |
|------|------|------|--------|
| `/login` | LoginView.vue | 管理员登录 | ✅ 基础 |
| `/dashboard` | DashboardView.vue | 数据仪表盘（4指标+7天趋势+最近线索） | ⚠️ 无图表库 |
| `/leads` | LeadsView.vue | 线索管理（列表/详情/状态流转/跟进/导出） | ✅ 较完善 |
| `/users` | UsersView.vue | 用户管理 | ❌ **仅只读列表**，无增删改禁 |
| `/contents` | ContentsView.vue | 内容管理（产品/行业/资源Tab） | ❌ **仅只读列表**，无CRUD |
| `/blogs` | BlogManagerView.vue | 博客文章管理 | ✅ 较完善 |
| `/forums` | ForumManagerView.vue | 论坛话题管理 | ⚠️ 无分类管理 |
| `/comment-moderation` | CommentModerationView.vue | 评论审核 | ✅ 较完善 |
| `/analytics` | AnalyticsView.vue | 数据分析 | ⚠️ 纯CSS柱状图，无专业图表 |
| `/experiments` | ExperimentView.vue | A/B测试管理 | ⚠️ 基础功能 |
| `/download-records` | DownloadRecordView.vue | 下载留资记录 | ⚠️ 基础功能 |
| `/sensitive-words` | SensitiveWordView.vue | 敏感词管理 | ⚠️ 基础功能 |

### 1.2 后端已就绪但前端完全缺失的管理模块

以下后端均提供完整 CRUD API，但 Admin **无任何对应页面**：

| 缺失模块 | 后端API | 业务影响 |
|---------|---------|---------|
| **首页/门户板块配置** | `CmsController`: Pages, Sections, ProductTabs, Industries, Testimonials, Stats, Logos, WhyUs, AiCards, Resources, Navigations, Translations | 营销门户15个Section无法后台维护 |
| **角色/权限管理** | `RoleController` (`/roles`) 完整CRUD | 无法后台分配角色和权限矩阵 |
| **多租户Workspace管理** | `WorkspaceController` (`/workspaces`) | 无法查看/管理租户和成员 |
| **系统设置** | `SystemController` (`/system/settings`) | 无法配置全局参数 |
| **审计日志** | `SystemController` (`/system/audit-logs`) | 无法追踪管理员操作 |
| **邮件模板管理** | `SystemController` (`/system/email-templates`) | 无法编辑系统邮件 |
| **媒体库/文件管理** | `MediaController` (`/medias`) 完整CRUD | 无法管理上传文件 |
| **新闻管理** | `NewsController` (`/news`) | 无后台管理页 |
| **案例管理** | `CaseController` (`/cases`) | 无后台管理页 |
| **招聘管理** | `CareersController` (`/careers`) | 无后台管理页 |
| **团队/合作伙伴管理** | `AboutController` (`/about/team`, `/about/partners`) | 无后台管理页 |
| **博客/论坛分类管理** | 后端完整支持Categories CRUD | 前端无分类管理界面 |

### 1.3 覆盖率评估

- 后端约 **24个管理模块** 具备完整API
- Admin 前端仅对接约 **6-7个模块**（且多个为只读）
- **覆盖率约 25%-30%**

---

## 二、权限控制与 RBAC 审查

### 2.1 后端实现状态

| 组件 | 状态 | 说明 |
|------|------|------|
| `Role` + `Permission` 模型 | ✅ 已建模 | 多对多关系，支持 `resource` + `action` 组合 |
| `RolesGuard` + `@Roles()` | ✅ 已启用 | 基于角色名拦截（SUPER_ADMIN / ADMIN / USER） |
| `JwtAuthGuard` | ✅ 全局启用 | 校验JWT + TokenBlacklist查询 |
| **PermissionGuard** | ❌ **未启用** | `Permission` 表已建模但**没有任何守卫读取 `user.role.permissions`** |

**结论**: 当前为"粗粒度RBAC"（基于角色名），Permission 表处于**"已建模但未启用"**状态。无法实现如"仅允许编辑博客但不可管理线索"的细粒度控制。

### 2.2 Admin 前端实现状态

| 组件 | 状态 | 问题 |
|------|------|------|
| `auth.js` Pinia Store | ⚠️ 基础实现 | 有 `hasPermission()` 方法，但页面中极少使用 |
| `v-permission` 指令 | ⚠️ 有代码 | 使用 `el.parentNode.removeChild(el)` 直接操作DOM，Vue3虚拟DOM无法感知，可能导致内存泄漏 |
| **路由权限拦截** | ❌ **完全缺失** | `router.beforeEach` 仅检查 `isLoggedIn`，**没有任何角色/权限路由拦截**。普通USER可直接访问 `/users` 等管理路由 |
| **菜单权限过滤** | ❌ **完全缺失** | `LayoutView.vue` 左侧11个菜单全部硬编码，**未按权限条件渲染** |
| **按钮权限控制** | ❌ **完全缺失** | 所有"新建"/"编辑"/"删除"按钮均未绑定 `v-permission` |
| **Token刷新** | 🐛 **Bug** | `client.js` 调用 `auth.refreshToken` / `auth.setToken()` / `auth.setRefreshToken()`，但 `auth.js` 中**完全不存在这些方法**。Token过期后自动刷新直接异常 → 强制登出 |

### 2.3 风险等级

- **🔴 P0**: 路由无权限拦截 + 菜单未过滤 = 低权限用户可浏览所有管理界面（虽然后端API会403，但界面已暴露）
- **🟡 P1**: Token刷新逻辑断裂，影响所有用户会话体验
- **🟡 P1**: `v-permission` 指令实现方式危险

---

## 三、多租户（Workspace）审查

### 3.1 已实现部分

| 组件 | 状态 | 说明 |
|------|------|------|
| `Workspace` 模型 | ✅ | 含 `slug`/`plan`/`status`/`ownerId` |
| `User.workspaceId` + `workspaceRole` | ✅ | 支持 OWNER/ADMIN/MEMBER |
| `WorkspaceInterceptor` | ✅ | AsyncLocalStorage注入当前workspaceId |
| `WorkspaceController` | ✅ | 查看/创建/更新/邀请成员 |
| Prisma扩展自动过滤 | ⚠️ | 对 `WORKSPACE_MODELS` 中的模型自动注入workspaceId |

### 3.2 关键缺陷

#### 🔴 P0: `User.email` 全局 `@unique`
```prisma
model User {
  email String @unique  // ← 阻塞一人多Workspace
}
```
SaaS核心场景"一个用户属于多个Workspace"无法实现。必须改为复合唯一：
```prisma
@@unique([email, workspaceId])
```

#### 🟡 P1: `findUnique` 未注入 `workspaceId`
Prisma扩展中 `findUnique` 仅注入 `deletedAt: null`，不注入 `workspaceId`。理论上可通过 `findUnique` 跨租户访问数据。

#### 🟡 P1: 部分模型遗漏Workspace过滤
以下模型有 `workspaceId` 字段，但**未列入 `WORKSPACE_MODELS`**，不会被Prisma扩展自动过滤：
- `Resource`
- `CaseStudy`
- `News`
- `Job`
- `DownloadRecord`

**风险**: 完全依赖上层Controller/Service手动限制，存在数据泄漏风险。

#### 🟡 P1: Admin无Workspace管理UI
后端完整支持Workspace CRUD，但Admin前端**没有任何Workspace管理页面**。

---

## 四、CMS 内容管理与配置性审查

### 4.1 后端CMS能力（已完备）

`prisma/schema.prisma` 中CMS模型**全部已落地**：

| 模型 | 对应前端Section | 后端API |
|------|----------------|---------|
| `Page` / `Section` | 首页动态板块编排 | ✅ CRUD |
| `ProductTab` / `Product` | 产品矩阵 | ✅ CRUD |
| `Industry` | 行业方案 | ✅ CRUD |
| `Testimonial` | 客户证言 | ✅ CRUD |
| `Stat` | 统计数据 | ✅ CRUD |
| `ClientLogo` | Logo墙 | ✅ CRUD |
| `WhyUsTab` | 为什么选我们 | ✅ CRUD |
| `AiCard` | AI Family | ✅ CRUD |
| `ResourceCategory` / `Resource` | 资源中心 | ✅ CRUD |
| `Navigation` / `NavItem` | 导航菜单 | ✅ CRUD |
| `Translation` | 多语言 | ✅ CRUD |
| `CaseStudy` / `CaseStudyMetric` | 客户案例 | ✅ CRUD |
| `News` | 新闻动态 | ✅ CRUD |
| `TeamMember` | 团队介绍 | ✅ CRUD |
| `Partner` | 合作伙伴 | ✅ CRUD |
| `Job` / `JobApplication` | 招聘 | ✅ CRUD |

所有CMS公开GET接口均标记 `@Public()` + `@Cacheable({ ttl: 300 })`，写操作限定 `ADMIN`/`SUPER_ADMIN` + `@CacheEvict`。

### 4.2 前端数据层状态（严重滞后）

营销门户前端**仍使用静态 JS 常量**，未接入CMS API：

| 静态数据文件 | 消费组件 | CMS API接入 |
|-------------|---------|------------|
| `src/data/products.js` | ProductMatrixSection | ❌ 未接入 |
| `src/data/industries.js` | IndustrySolutionSection | ❌ 未接入 |
| `src/data/testimonials.js` | TestimonialSection | ❌ 未接入 |
| `src/data/resources.js` | ResourceSection | ❌ 未接入 |
| `src/data/navigation.js` | NavBar / Footer | ❌ 未接入 |
| `src/data/logos.js` | LogoWallSection | ❌ 未接入 |
| `src/data/stats.js` | StatsSection | ❌ 未接入 |
| `src/data/aiFamily.js` | AiFamilySection | ❌ 未接入 |
| `src/data/whyUs.js` | WhyUsSection | ❌ 未接入 |

**AGENTS.md §5.1** 明确说明: "营销门户纯静态 JS 常量（`src/data/`）；博客/论坛接入后端 NestJS API（`src/api/`）"

### 4.3 Admin CMS管理状态

`ContentsView.vue` 仅提供 **3个Tab的只读表格**（产品矩阵、行业方案、资源中心），**无任何创建/编辑/删除功能**。后端全套POST/PATCH/DELETE接口已就绪，前端完全未对接。

### 4.4 配置性评估

| 配置维度 | 状态 | 说明 |
|---------|------|------|
| 首页板块展示/隐藏控制 | ❌ 未实现 | 无Section启用/禁用开关 |
| 板块排序控制 | ⚠️ 后端支持 | `Section.sortOrder` 已建模，Admin无UI |
| 内容动态编辑 | ❌ 未实现 | Admin无CMS编辑器 |
| Logo维护 | ❌ 未实现 | Admin无Logo管理页 |
| 导航菜单维护 | ❌ 未实现 | Admin无Navigation管理页 |
| 多语言内容维护 | ❌ 未实现 | Admin无Translation管理页 |
| 系统设置 | ❌ 未实现 | Admin无Settings管理页 |
| 邮件模板 | ❌ 未实现 | Admin无EmailTemplate管理页 |

---

## 五、产品设计完整度审查

### 5.1 文档与代码同步度

| 文档 | 状态 | 问题 |
|------|------|------|
| `docs/prd.md` | ❌ 严重滞后 | 框架初始化状态，大量"待产品经理Agent填充" |
| `docs/architecture.md` | ⚠️ 多处过时 | 含React残留（`useState`/`useEffect`）、`@vitejs/plugin-react`、Vite版本未同步（文档写Vite 5，实际Vite 8） |
| `docs/backend-phase2-plan.md` | ⚠️ 规划未完全落地 | Admin规划7个页面，实际13个但大量为只读；CMS动态化未落地 |
| `docs/project-plan.md` | ✅ 较新 | 已完成v2.3~v2.5标记，v3.0.0部分完成 |

### 5.2 功能完整度对比（后端API vs Admin前端 vs 营销门户）

```
后端API能力          Admin前端            营销门户
─────────────────────────────────────────────────────────
Auth                ✅ 登录              ✅ 登录/注册
User CRUD           ⚠️ 只读列表          ✅ 个人中心
Role/Permission     ❌ 无页面             —
Workspace           ❌ 无页面             —
CMS (15+板块)       ❌ 仅只读             ❌ 静态常量
Blog                ✅ 较完善             ✅ 完整
Forum               ✅ 基础               ✅ 完整
Comment             ✅ 较完善             ✅ 展示
Lead/DemoBooking    ✅ 较完善             ✅ 表单提交
Analytics           ⚠️ 基础               ✅ 埋点上报
News                ❌ 无页面             ✅ 展示
CaseStudy           ❌ 无页面             ✅ 展示
Careers             ❌ 无页面             ✅ 展示
Media               ❌ 无页面             —
System Settings     ❌ 无页面             —
Email Templates     ❌ 无页面             —
Audit Logs          ❌ 无页面             —
A/B Experiments     ⚠️ 基础               ✅ 实验框架
Search              —                    ✅ 搜索功能
Notifications       —                    —
```

---

## 六、技术架构审查

### 6.1 Admin 前端架构问题

| 问题 | 位置 | 说明 |
|------|------|------|
| **无组件复用** | `src/components/` 不存在 | 所有表格/分页/表单逻辑全部内联在View中 |
| **无图表库** | Analytics/Dashboard | 纯CSS `div`拼接柱状图，无ECharts/AntV |
| **无富文本编辑器** | BlogManagerView | 使用 `el-input type="textarea"` |
| **无图片上传组件** | 全局 | 无法直接上传封面图/头像 |
| **内联样式泛滥** | 各View | 大量 `style="..."` 直接写模板 |
| **无面包屑导航** | 全局 | 无任何页面位置指示器 |
| **无响应式适配** | 全局 | 未考虑移动端 |
| **数据解析Bug** | UsersView/LeadsView等 | `client.js`已解包`res.data`，但视图仍访问`res.data.items`，导致列表为空 |
| **分页参数名错误** | BlogManagerView | 使用`limit=20`，后端接受`pageSize` |

### 6.2 后端架构问题

| 问题 | 级别 | 说明 |
|------|------|------|
| Permission表未启用 | 🟡 P1 | `RolesGuard`仅校验角色名，未读取`user.role.permissions` |
| `findUnique`跨租户 | 🟡 P1 | Prisma扩展中未注入workspaceId |
| Workspace过滤遗漏 | 🟡 P1 | Resource/CaseStudy/News/Job/DownloadRecord未纳入WORKSPACE_MODELS |
| 无IP黑白名单 | 🟡 P1 | 仅有Token黑名单，无IP层访问控制 |
| 审计日志不记请求体 | 🟢 P2 | 安全设计，但降低可追溯性 |
| 后端无Sentry | 🟢 P2 | 仅有Prometheus指标，错误追踪依赖日志 |
| `User.email`全局唯一 | 🔴 P0 | 阻塞多租户核心场景 |

---

## 七、高并发与性能审查

### 7.1 已实现的优化

| 组件 | 状态 | 说明 |
|------|------|------|
| Redis缓存 | ✅ | `CacheInterceptor`全局拦截，`@Cacheable`/`@CacheEvict`支持。CMS GET接口缓存300s |
| Meilisearch搜索 | ✅ | 索引`blog_posts`/`forum_topics`/`products`，异步队列同步 |
| BullMQ队列 | ✅ | notification/lead-nurture/search-index三队列，均配`attempts:3`+指数退避+死信记录 |
| 数据库索引 | ✅ | 外键/查询字段/复合查询均有`@@index` |
| 软删除 | ✅ | `softDeleteExtension`自动注入`deletedAt: null` |
| 流式导出 | ✅ | ExportService游标分页+exceljs流式写入，上限50,000行 |
| Prometheus监控 | ✅ | `http_requests_total` + `http_request_duration_seconds` |
| 限流 | ✅ | Throttler三层策略：default(60s/500)/auth(60s/10)/search(60s/30) |
| 查询计时 | ✅ | `TimingInterceptor`记录接口耗时，>500ms打warn |

### 7.2 性能关注点

| 问题 | 说明 |
|------|------|
| CacheEvict使用SCAN | 写操作后通过`SCAN`匹配前缀批量删缓存，比`KEYS`安全但仍需注意大key扫描 |
| Meilisearch索引同步 | `SearchIndexProcessor`异步消费，但需监控队列堆积 |
| 前端无懒加载/虚拟滚动 | Admin列表页可能在大数据量下卡顿 |
| 无CDN/静态资源优化 | 前端构建产物未配置CDN分发策略 |

---

## 八、安全与合规审查

### 8.1 已实施的安全措施

| 措施 | 状态 |
|------|------|
| JWT Access/Refresh Token | ✅ |
| TokenBlacklist登出撤销 | ✅ |
| bcrypt密码哈希(cost 12) | ✅ |
| PII字段级加密(AES-256-GCM) | ✅ |
| Helmet安全响应头 | ✅ |
| CORS白名单限制 | ✅ |
| reCAPTCHA v3 | ✅ |
| 敏感词过滤 | ✅ |
| 全局限流 | ✅ |
| 审计日志 | ✅ |

### 8.2 安全缺口

| 缺口 | 级别 | 说明 |
|------|------|------|
| **权限系统未落地** | 🔴 P0 | 前端无路由/菜单/按钮级权限控制 |
| **无IP黑白名单** | 🟡 P1 | 无法限制恶意IP访问 |
| **Token刷新逻辑断裂** | 🟡 P1 | 可能导致Token泄露后无法及时回收 |
| **`v-permission` DOM操作** | 🟢 P2 | 可能导致内存泄漏 |
| **审计日志不记录请求体** | 🟢 P2 | 安全设计但追溯性降低 |
| **无WAF/防刷** | 🟢 P2 | 依赖限流，无行为验证码（除reCAPTCHA外） |

---

## 九、技术债清单

### 🔴 P0 — 阻塞级（必须立即修复）

| # | 技术债 | 影响 | 建议修复方案 | 状态 |
|---|--------|------|-------------|------|
| P0-1 | **Admin CMS内容管理无CRUD** | 运营无法维护门户内容 | 为每个CMS板块创建Admin管理页 | ✅ v3.0.0 已完成 |
| P0-2 | **`User.email`全局`@unique`阻塞多租户** | SaaS无法支持一人多Workspace | Prisma迁移：改为`@@unique([email, workspaceId])` | ⏳ 待 Prisma migrate |
| P0-3 | **Admin路由无权限拦截** | 低权限用户可浏览管理界面 | `router.beforeEach`增加角色校验 | ✅ v3.0.0 已完成 |
| P0-4 | **营销门户仍读静态JS常量** | CMS后端能力浪费 | 营销门户核心Section接入CMS API | ✅ v3.0.0 HomePage已接入 |

### 🟡 P1 — 重要级（建议1-2个Sprint内修复）

| # | 技术债 | 影响 | 建议修复方案 | 状态 |
|---|--------|------|-------------|------|
| P1-1 | **Permission表已建模但未启用** | 无法实现细粒度权限 | 新增`PermissionGuard`，`@Permission()`装饰器 | ✅ v3.0.0 已全局注册，BlogController已使用 |
| P1-2 | **Workspace数据隔离漏洞** | 部分模型未纳入WORKSPACE_MODELS | 扩展WORKSPACE_MODELS列表 | ✅ v3.0.0 已覆盖全部模型 |
| P1-3 | **Token刷新逻辑调用不存在的方法** | Token过期强制登出 | 修复`auth.js` | ✅ v3.0.0 auth.js已有refreshToken/setToken |
| P1-4 | **Admin数据解析Bug（`res.data.items`）** | 多个列表页显示为空 | 统一前后端响应格式 | ✅ v3.0.0 已统一为res.data + res.meta |
| P1-5 | **无IP黑白名单** | 运维安全缺口 | 新增`IpFilterGuard` | ✅ v3.0.0 已实现并在app.module注册 |
| P1-6 | **Admin缺失系统管理页面** | 无法配置系统参数 | 新增Settings/EmailTemplates/AuditLogs/Media | ✅ v3.0.0 全部页面已创建 |
| P1-7 | **Admin缺失用户/角色/Workspace管理** | 无法分配权限和管理租户 | 新增Users/Roles/Workspace管理页 | ✅ v3.0.0 全部页面已创建 |
| P1-8 | **无富文本编辑器** | 博客内容管理体验差 | 集成TipTap/Quill | ✅ v3.0.0 RichEditor.vue已集成 |
| P1-9 | **无图表库** | 数据分析可视化能力弱 | 集成ECharts | ✅ v3.0.0 vue-echarts已集成，Dashboard已有图表 |
| P1-10 | **`v-permission` DOM操作方式危险** | Vue3虚拟DOM状态不一致 | 改为条件渲染 | ✅ v3.0.0 已修复为条件渲染 |
| P1-11 | **分页参数名不统一** | BlogManagerView使用`limit` | 统一为`pageSize` | ✅ v3.0.0 已统一 |

### 🟢 P2 — 优化级（建议排入后续迭代）

| # | 技术债 | 影响 | 建议修复方案 | 状态 |
|---|--------|------|-------------|------|
| P2-1 | **PRD与架构文档严重滞后** | 新成员上手成本高 | 重写`prd.md`和`architecture.md` | ⏳ 排入Sprint 21 |
| P2-2 | **Admin无响应式适配** | 移动端体验差 | 增加Element Plus响应式布局 | ⏳ 低优先级 |
| P2-3 | **Admin无面包屑导航** | 导航体验差 | 增加Breadcrumb组件 | ✅ v3.0.0 LayoutView已集成el-breadcrumb |
| P2-4 | **Admin无通知中心** | 后端SSE通知无法消费 | 增加通知角标和消息列表 | ✅ v3.0.0 NotificationBell.vue已实现 |
| P2-5 | **后端无Sentry集成** | 错误追踪依赖日志 | 增加Sentry NestJS SDK | ✅ v3.0.0 占位文件已创建 |
| P2-6 | **无组件复用体系** | 维护成本高 | 抽离通用组件 | ✅ v3.0.0 CmsTable等通用组件已创建 |
| P2-7 | **无图片上传组件** | 无法直接管理媒体 | 集成Element Plus Upload | ⏳ 排入Sprint 21（模块A） |
| P2-8 | **JSON-LD结构化数据未完全** | SEO-03标记为⏳ | 补全所有页面JSON-LD | ✅ 本次会话已完成24个页面 |
| P2-9 | **字体子集化未实现** | PERF-02标记为⏳ | 实施Noto Sans SC子集化 | ✅ v3.0.0 已集成到build脚本 |
| P2-10 | **前端console.log未完全清理** | 生产环境可能泄露信息 | 扫描并移除硬编码console | ✅ v3.0.0 全部已加DEV保护 |

---

## 十、迭代修复路线图建议

### Phase 1: 安全与稳定性（1-2周）

1. **修复Token刷新逻辑**（P1-3）
2. **修复数据解析Bug**（P1-4）
3. **修复分页参数名**（P1-11）
4. **修复`v-permission`实现**（P1-10）
5. **Admin路由增加角色拦截**（P0-3）
6. **Admin菜单按权限过滤**（P0-3）

### Phase 2: 多租户解阻塞（1-2周）

1. **修改`User.email`唯一性约束**（P0-2）
2. **扩展WORKSPACE_MODELS覆盖全部模型**（P1-2）
3. **修复`findUnique`跨租户问题**（P1-2）
4. **新增Workspace管理页**（P1-7）
5. **完善Workspace数据隔离测试**

### Phase 3: CMS动态化（3-4周）

1. **营销门户核心Section接入CMS API**（P0-4）
   - 优先：Stats、Logos、Testimonials、Navigation
   - 其次：Products、Industries、AiCards、WhyUs、Resources
2. **Admin CMS管理页开发**（P0-1）
   - 为每个板块创建CRUD管理界面
   - 支持Section启用/禁用/排序
3. **新增媒体库管理**（P2-7）
4. **集成富文本编辑器**（P1-8）

### Phase 4: 权限与系统管理（2-3周）

1. **启用Permission细粒度权限**（P1-1）
2. **新增角色/权限管理页**（P1-7）
3. **新增系统设置页**（P1-6）
4. **新增邮件模板管理页**（P1-6）
5. **新增审计日志查看页**（P1-6）
6. **新增IP黑白名单配置**（P1-5）

### Phase 5: 体验优化（2-3周）

1. **集成图表库**（P1-9）
2. **补全缺失管理模块**（新闻/案例/招聘/团队/合作伙伴）
3. **Admin响应式适配**（P2-2）
4. **通知中心**（P2-4）
5. **文档同步更新**（P2-1）

---

## 附录：后端API完整清单

| 模块 | 控制器 | 端点 | 前端对应页 |
|------|--------|------|-----------|
| Auth | AuthController | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/profile` | LoginView |
| User | UserController | `/users` (CRUD+搜索) | UsersView ⚠️只读 |
| Role | RoleController | `/roles` (CRUD) | ❌ 无 |
| Workspace | WorkspaceController | `/workspaces/me`, `/workspaces`, `/workspaces/:id/invite` | ❌ 无 |
| CMS | CmsController | `/cms/pages`, `/cms/sections`, `/cms/products`, `/cms/industries`, `/cms/testimonials`, `/cms/stats`, `/cms/logos`, `/cms/why-us`, `/cms/ai-cards`, `/cms/resources`, `/cms/navigations`, `/cms/translations` | ContentsView ⚠️只读3个Tab |
| Blog | BlogController | `/blogs/categories`, `/blogs/posts`, `/blogs/tags`, `/blogs/comments` | BlogManagerView ✅ |
| Forum | ForumController | `/forums/categories`, `/forums/topics`, `/forums/posts` | ForumManagerView ⚠️无分类管理 |
| Lead | LeadController | `/demo-bookings` (CRUD+stats+follow-ups) | LeadsView ✅ |
| Search | SearchController | `/search`, `/search/suggestions` | — |
| Media | MediaController | `/medias` (CRUD+stats) | ❌ 无 |
| Analytics | AnalyticsController | `/analytics/page-views`, `/analytics/events`, `/analytics/activities`, `/analytics/dashboard`, `/analytics/funnel` | AnalyticsView ⚠️基础 |
| System | SystemController | `/system/settings`, `/system/audit-logs`, `/system/email-templates`, `/system/sensitive-words`, `/system/moderation-test` | SensitiveWordView ⚠️基础 |
| Notification | NotificationController | `/notifications`, `/notifications/stream` | ❌ 无 |
| AI | AiController | `/ai/chat`, `/ai/chat-stream` | — |
| Export | ExportController | `/admin/export/leads`, `/admin/export/users`, `/admin/export/analytics` | LeadsView/DownloadRecordView |
| Experiment | ExperimentController | `/experiments` (CRUD+stats) | ExperimentView ⚠️基础 |
| Download | DownloadController | `/downloads` | DownloadRecordView ⚠️基础 |
| Case | CaseController | `/cases`, `/cases/industries` | ❌ 无 |
| News | NewsController | `/news`, `/news/categories` | ❌ 无 |
| Careers | CareersController | `/careers`, `/careers/departments`, `/careers/:id/apply` | ❌ 无 |
| About | AboutController | `/about/team`, `/about/partners` | ❌ 无 |
| Health | HealthController | `/health`, `/health/ready`, `/health/live` | — |
| Metrics | MetricsController | `/metrics` | — |
