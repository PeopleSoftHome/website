# TalentPro App Marketplace — 应用广场模块规划文档

> **文档版本**: v1.0.0 | **规划日期**: 2026-06-09
> **定位**: 世界级 HR SaaS 应用商店，面向中大型企业的一站式 HR 数字化解决方案采购平台
> **参考标杆**: Shopify App Store · Salesforce AppExchange · AWS Marketplace · Slack App Directory

---

## 一、产品愿景与定位

### 1.1 一句话定义

> **TalentPro App Marketplace** 是面向中大型企业 HR 部门的数字化解决方案分发与订阅平台，连接 ISV（独立软件供应商）与企业客户，提供「发现 → 试用 → 订阅 → 集成 → 管理」的一站式应用生命周期体验。

### 1.2 目标用户

| 角色 | 诉求 | 使用场景 |
|------|------|---------|
| **企业 HR 采购决策者** (CHRO/HRD/IT Director) | 快速发现可信的 HR 扩展应用，降低采购风险 | 浏览分类、查看评分、申请试用、审批订阅 |
| **企业 HR 业务用户** (HRBP/专员) | 按需安装工具解决具体业务痛点 | 搜索应用、一键安装、配置使用 |
| **ISV / 生态伙伴** | 在 TalentPro 生态中分发产品，获取企业客户 | 提交应用、管理版本、查看收入分析 |
| **TalentPro 平台运营** | 管理应用审核、收入分成、生态健康度 | 审核上架、监控数据、处理结算 |

### 1.3 核心价值主张

```
传统模式                    Marketplace 模式
─────────────────────────────────────────────────
线下询价 → 招投标 → 签约    浏览 → 试用 → 订阅 (5分钟)
单一厂商锁定                开放生态，灵活组合
6个月上线周期               即装即用，预置集成
一次性大额采购              SaaS 订阅，按月付费
```

---

## 二、核心功能架构

### 2.1 功能全景图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端展示层 (Marketing Portal)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 应用列表页   │  │ 应用详情页   │  │ 购物车/结算  │         │
│  │ /marketplace│  │ /marketplace│  │ /marketplace│         │
│  │             │  │ /:slug      │  │ /cart       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 我的应用     │  │ 订阅管理     │  │ 支付回调页   │         │
│  │ /profile    │  │ /profile    │  │ /marketplace│         │
│  │ /apps       │  │ /billing    │  │ /checkout   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    后端 API 层 (NestJS)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ App 管理     │  │ 订阅管理     │  │ 订单/支付    │         │
│  │ /apps        │  │ /subscriptions│  │ /orders     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 分类/标签    │  │ 评分/评论    │  │ ISV 管理     │         │
│  │ /categories  │  │ /reviews     │  │ /vendors    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Admin 后台 (Vue 3)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 应用审核     │  │ 订阅管理     │  │ 收入分析     │         │
│  │ 应用上架     │  │ 退款处理     │  │ 分成结算     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 功能模块详细设计

#### M1 — 应用发现 (Discovery)

**应用列表页 `/marketplace`**
- 顶部 Hero 区：搜索框 + 热门标签 + 个性化推荐
- 分类导航：左侧固定分类树（按 HR 业务域组织）
  - 招聘与人才获取
  - 薪酬与福利
  - 绩效与目标
  - 学习与发展
  - 员工体验
  - 合规与安全
  - AI 与自动化
  - 数据与分析
- 筛选器：评分、价格区间、部署方式（云/混合/本地）、认证状态、兼容性
- 排序：相关性 / 评分 / 安装量 / 最新上架
- 卡片布局：大图卡片（Featured）+ 紧凑列表切换
- 每个卡片：图标、名称、评分、价格标签（免费/付费/订阅）、安装量、一句话描述

**应用详情页 `/marketplace/:slug`**
- 顶部：应用图标 + 名称 + 开发商 + 评分 + 安装按钮
- 标签页：
  - **概览**：高清截图轮播 + 功能亮点 + 集成能力 + 兼容性说明
  - **定价**：清晰的价格 tiers（免费/基础/专业/企业），按年/按月切换，功能对比表
  - **评价**：星级分布 + 文字评价 + 官方回复
  - **文档**：快速开始指南 + API 文档链接
- 右侧边栏：立即安装/试用按钮 + 已安装企业数 + 开发商信息 + 相关推荐
- 底部 CTA："不确定？预约专属顾问为您推荐"

#### M2 — 订阅与支付 (Subscription & Billing)

**定价模型支持**：
| 模型 | 说明 | 示例 |
|------|------|------|
| 免费 (Free) | 基础功能永久免费 | 考勤打卡基础版 |
| 一次性购买 (One-time) | 永久许可 | 定制报表模板包 |
| 订阅制 (Subscription) | 按月/年付费 | AI 面试官 Pro |
| 用量计费 (Usage-based) | 按调用量/人数付费 | SMS 通知服务 |
|  freemium | 免费+增值 | 测评系统（免费50人/月）|

**购物车与结算 `/marketplace/cart`**
- 多应用批量订阅
- Workspace 级别购买（非个人）
- 优惠券/折扣码
- 发票信息配置
- 支付渠道选择

**支付集成架构**：
- 主通道：Stripe（国际信用卡、企业账单）
- 国内通道：支付宝（企业/个人）+ 微信支付
- 对公转账：大额订单线下审批流程
- 发票：电子发票自动开具（数电票）

#### M3 — 应用生命周期管理 (Lifecycle)

**我的应用 `/profile/apps`**
- 已安装应用列表
- 订阅状态（活跃/即将到期/已过期）
- 版本管理（自动更新/手动确认）
- 配置入口（跳转应用配置页）
- 卸载/暂停

**订阅管理 `/profile/billing`**
- 当前订阅概览
- 续费/升级/降级
- 账单历史与发票下载
- 支付方式管理
- 消费预警设置

#### M4 — ISV 生态伙伴 (Vendor Portal)

**ISV 控制台**（未来可扩展为独立子域名）
- 应用提交与版本管理
- 收入报表与分成结算
- 客户评价管理
- API 使用统计
- 营销素材管理

---

## 三、数据模型设计 (Prisma Schema)

### 3.1 核心模型

```prisma
// ==================== Marketplace Enums ====================

enum AppStatus {
  DRAFT          // 开发中
  PENDING_REVIEW // 提交审核
  APPROVED       // 审核通过待上架
  PUBLISHED      // 已上架
  REJECTED       // 审核未通过
  SUSPENDED      // 已下架/暂停
  DEPRECATED     // 已弃用
}

enum PricingModel {
  FREE
  ONE_TIME
  SUBSCRIPTION
  USAGE_BASED
  FREEMIUM
}

enum SubscriptionStatus {
  TRIAL        // 试用期
  ACTIVE       // 生效中
  PAST_DUE     // 逾期未付
  CANCELLED    // 已取消
  EXPIRED      // 已过期
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentProvider {
  STRIPE
  ALIPAY
  WECHAT_PAY
  BANK_TRANSFER
}

// ==================== App (应用) ====================

model App {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  tagline     String
  description String   @db.Text
  
  // 分类与标签
  categoryId  String
  category    AppCategory @relation(fields: [categoryId], references: [id])
  tags        String[] // e.g., ["AI", "招聘", "视频面试"]
  
  // 开发商
  vendorId    String
  vendor      AppVendor @relation(fields: [vendorId], references: [id])
  
  // 媒体资源
  iconUrl     String
  coverImages String[] // 截图/GIF 轮播
  demoVideoUrl String?
  
  // 定价
  pricingModel PricingModel
  pricingTiers Json? // [{ name, priceMonthly, priceYearly, features[], limit }]
  
  // 状态
  status      AppStatus @default(DRAFT)
  featured    Boolean @default(false)
  featuredSortOrder Int?
  
  // 统计
  installCount Int @default(0)
  ratingAvg    Float @default(0)
  ratingCount  Int @default(0)
  
  // 元信息
  version     String
  compatibility String[] // ["talentpro-v3.0+", "talentpro-v4.0+"]
  integrationType String // "oauth", "webhook", "sdk", "iframe"
  
  // 审核
  reviewNotes  String? @db.Text
  reviewedBy   String?
  reviewedAt   DateTime?
  
  // 标准字段
  workspaceId  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
  
  // 关联
  reviews      AppReview[]
  subscriptions Subscription[]
  
  @@index([workspaceId])
  @@index([status])
  @@index([categoryId])
  @@index([vendorId])
  @@index([featured, featuredSortOrder])
  @@index([pricingModel])
}

// ==================== AppCategory (应用分类) ====================

model AppCategory {
  id          String @id @default(cuid())
  slug        String @unique
  name        String
  description String?
  icon        String?
  sortOrder   Int @default(0)
  parentId    String?
  parent      AppCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    AppCategory[] @relation("CategoryHierarchy")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  apps        App[]
  
  @@index([parentId])
  @@index([sortOrder])
}

// ==================== AppVendor (开发商/ISV) ====================

model AppVendor {
  id          String @id @default(cuid())
  slug        String @unique
  name        String
  logoUrl     String?
  website     String?
  description String? @db.Text
  
  // 联系信息
  contactEmail String
  contactPhone String?
  
  // 资质
  verified    Boolean @default(false)
  certifications String[] // ["ISO27001", "等保三级"]
  
  // 分成
  revenueShareRate Float @default(0.70) // ISV 获得 70%
  
  // 关联
  userId      String? // 绑定的平台用户账号
  apps        App[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

// ==================== AppReview (评价) ====================

model AppReview {
  id        String @id @default(cuid())
  appId     String
  app       App @relation(fields: [appId], references: [id])
  
  userId    String
  workspaceId String?
  
  rating    Int // 1-5
  title     String?
  content   String @db.Text
  
  // 官方回复
  replyContent String? @db.Text
  replyBy      String?
  replyAt      DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  
  @@index([appId])
  @@index([userId])
  @@index([workspaceId])
}

// ==================== Subscription (订阅) ====================

model Subscription {
  id          String @id @default(cuid())
  
  appId       String
  app         App @relation(fields: [appId], references: [id])
  
  workspaceId String
  
  // 定价信息快照
  tierName    String
  pricingModel PricingModel
  amount      Float // 金额
  currency    String @default("CNY")
  interval    String // "month" | "year"
  
  // 状态
  status      SubscriptionStatus @default(TRIAL)
  trialEndsAt DateTime?
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  // 取消
  cancelAtPeriodEnd Boolean @default(false)
  cancelledAt       DateTime?
  
  // 外部 ID
  provider      PaymentProvider?
  providerSubId String? // Stripe subscription ID, etc.
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  orders        Order[]
  
  @@index([appId])
  @@index([workspaceId])
  @@index([status])
  @@index([providerSubId])
}

// ==================== Order (订单) ====================

model Order {
  id          String @id @default(cuid())
  orderNo     String @unique // human-readable e.g., "TP-20260609-XXXX"
  
  subscriptionId String?
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  
  workspaceId String
  userId      String
  
  // 金额
  subtotal    Float
  discount    Float @default(0)
  tax         Float @default(0)
  total       Float
  currency    String @default("CNY")
  
  // 状态
  status      PaymentStatus @default(PENDING)
  paidAt      DateTime?
  
  // 支付
  provider    PaymentProvider?
  providerPaymentId String?
  
  // 发票
  invoiceRequested Boolean @default(false)
  invoiceNo        String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([workspaceId])
  @@index([status])
  @@index([orderNo])
}

// ==================== Cart (购物车 - 可选 Redis) ====================
// 建议用 Redis 存储购物车（Workspace 级别），不持久化到 PostgreSQL
```

### 3.2 数据流设计

```
[ISV 提交 App] → [Admin 审核] → [状态: PUBLISHED]
                                ↓
[企业用户浏览] → [添加到 Workspace] → [创建 Subscription (TRIAL)]
                                          ↓
                              [试用到期/主动订阅] → [创建 Order]
                                                        ↓
                                           [支付网关处理] → [Subscription ACTIVE]
                                                        ↓
                                           [Webhook 回调更新状态]
```

---

## 四、前端架构设计

### 4.1 页面路由

```
src/pages/
├── marketplace/
│   ├── index.vue           # /marketplace 应用列表
│   ├── [slug].vue          # /marketplace/:slug 应用详情
│   └── cart.vue            # /marketplace/cart 购物车
├── profile/
│   ├── apps.vue            # /profile/apps 我的应用
│   └── billing.vue         # /profile/billing 订阅与账单
```

### 4.2 组件规划

```
src/components/
├── sections/
│   └── MarketplaceSection/     # 首页嵌入的应用广场入口区块
├── ui/
│   ├── AppCard/                # 应用卡片（列表/网格）
│   ├── AppFilter/              # 分类筛选面板
│   ├── PricingTiers/           # 定价方案对比
│   ├── RatingStars/            # 评分组件
│   ├── ReviewList/             # 评价列表
│   ├── CartModal/              # 购物车弹窗
│   ├── SubscriptionBadge/      # 订阅状态标签
│   └── VendorCard/             # 开发商信息卡
```

### 4.3 关键交互设计

**应用列表页**：
- 无限滚动加载（IntersectionObserver）
- URL 同步筛选状态（?category=recruitment&price=free,paid）
- 骨架屏 + 图片懒加载

**应用详情页**：
- 截图轮播支持触摸滑动
- 定价切换动画（月/年切换，年付折扣高亮）
- 安装/试用按钮状态机（未登录→登录→选择Workspace→确认→安装中→完成）

**购物车**：
- 侧边栏抽屉（z-index: 2000，与 DemoModal 同级）
- 实时价格计算（年付折扣自动应用）
- 优惠券实时校验

---

## 五、后端 API 设计

### 5.1 公开端点（`@Public()`）

```
GET  /api/v1/marketplace/apps              # 应用列表（支持过滤/排序/分页）
GET  /api/v1/marketplace/apps/featured     # 精选应用
GET  /api/v1/marketplace/apps/:slug        # 应用详情
GET  /api/v1/marketplace/categories        # 分类树
GET  /api/v1/marketplace/apps/:slug/reviews # 评价列表
GET  /api/v1/marketplace/vendors/:slug     # 开发商详情
GET  /api/v1/marketplace/search            # 应用搜索（接入 SearchService）
```

### 5.2 认证端点（需登录）

```
POST /api/v1/marketplace/apps/:slug/install      # 安装应用到 Workspace
POST /api/v1/marketplace/apps/:slug/trial        # 开始试用
POST /api/v1/marketplace/apps/:slug/reviews      # 提交评价
GET  /api/v1/marketplace/workspace/apps          # 我的应用
GET  /api/v1/marketplace/workspace/subscriptions # 我的订阅
GET  /api/v1/marketplace/workspace/orders        # 我的订单
POST /api/v1/marketplace/cart/checkout           # 结算创建订单
POST /api/v1/marketplace/orders/:id/cancel       # 取消订单
```

### 5.3 管理端点（`@Roles('ADMIN', 'SUPER_ADMIN')`）

```
GET    /api/v1/admin/marketplace/apps          # 应用管理列表
PATCH  /api/v1/admin/marketplace/apps/:id/status # 审核/上下架
GET    /api/v1/admin/marketplace/vendors       # ISV 管理
GET    /api/v1/admin/marketplace/orders        # 订单管理
GET    /api/v1/admin/marketplace/analytics     # 收入分析
POST   /api/v1/admin/marketplace/apps/:id/feature # 设置精选
```

### 5.4 Webhook 端点

```
POST /api/v1/webhooks/stripe        # Stripe 事件回调
POST /api/v1/webhooks/alipay        # 支付宝回调
POST /api/v1/webhooks/wechat        # 微信支付回调
```

---

## 六、支付架构设计

### 6.1 支付流程（Stripe 为例）

```
[用户点击订阅] → [后端创建 Stripe Checkout Session]
                    ↓
[前端跳转 Stripe Hosted Checkout]
                    ↓
[用户完成支付] → [Stripe webhook → 后端接收 checkout.session.completed]
                    ↓
[后端: 更新 Order.status = COMPLETED]
[后端: 创建/更新 Subscription.status = ACTIVE]
[后端: 发送通知到 Workspace Admin]
[后端: 激活应用权限]
```

### 6.2 国内支付（支付宝）

```
[用户点击订阅] → [后端调用支付宝预创建订单]
                    ↓
[前端展示支付宝二维码 / 跳转支付宝 App]
                    ↓
[支付宝异步通知] → [后端校验签名 → 更新订单状态]
```

### 6.3 安全设计

- Webhook 签名验证（Stripe webhook secret / 支付宝公钥验签）
- 幂等性控制（订单号唯一 + 状态机防重复处理）
- 金额校验（后端重新计算金额，不信任前端传来的 total）
- 敏感配置环境变量隔离（`STRIPE_SECRET_KEY`, `ALIPAY_PRIVATE_KEY`）

---

## 七、Admin 后台设计

### 7.1 新增菜单项

```
内容管理
  ├── 应用广场        /marketplace/apps
生态运营
  ├── ISV 管理        /marketplace/vendors
  ├── 订单管理        /marketplace/orders
  ├── 订阅管理        /marketplace/subscriptions
  └── 收入分析        /marketplace/analytics
```

### 7.2 关键视图

**应用审核 (`/marketplace/apps`)**
- 表格：名称 / 开发商 / 分类 / 定价模型 / 提交时间 / 状态 / 操作
- 操作：查看详情 → 审核弹窗（通过/拒绝 + 备注）→ 一键上架
- 筛选：按状态（待审核/已通过/已拒绝）

**ISV 管理 (`/marketplace/vendors`)**
- 表格：名称 / 认证状态 / 应用数 / 收入 / 分成比例
- 操作：编辑分成比例、发送通知、查看资质

**收入分析 (`/marketplace/analytics`)**
- 仪表盘：GMV / 订单数 / 新增订阅 / 流失率
- 图表：收入趋势（日/周/月）、分类收入占比、Top 应用排行
- 表格：待结算 ISV 列表

---

## 八、实现路线图

### Phase 1 — 基础设施与展示（Sprint 21-22，2周）

**目标**：应用可浏览、可搜索、可查看详情

| 任务 | 范围 | 工作量 |
|------|------|--------|
| P1-1 | Prisma Schema 迁移（App / AppCategory / AppVendor / AppReview） | 1d |
| P1-2 | 后端：App CRUD API + 分类 API + 搜索集成 | 2d |
| P1-3 | 后端：Seed 数据（10+ 示例应用） | 1d |
| P1-4 | 前端：应用列表页 `/marketplace` | 2d |
| P1-5 | 前端：应用详情页 `/marketplace/:slug` | 2d |
| P1-6 | 前端：导航集成 + 搜索索引扩展 | 0.5d |
| P1-7 | Admin：应用审核视图 | 1d |
| P1-8 | i18n：多语言 key 补充 | 0.5d |

### Phase 2 — 订阅与安装（Sprint 23-24，2周）

**目标**：应用可试用、可安装、Workspace 级管理

| 任务 | 范围 | 工作量 |
|------|------|--------|
| P2-1 | Prisma Schema 扩展（Subscription） | 0.5d |
| P2-2 | 后端：安装/试用 API + Workspace 权限校验 | 1.5d |
| P2-3 | 后端：应用安装状态查询 | 1d |
| P2-4 | 前端：我的应用页 `/profile/apps` | 1.5d |
| P2-5 | 前端：应用安装流程（弹窗交互） | 1.5d |
| P2-6 | 前端：订阅状态徽章与续费提醒 | 1d |
| P2-7 | Admin：订阅管理视图 | 1d |

### Phase 3 — 支付与订单（Sprint 25-26，2周）

**目标**：支持付费订阅、支付闭环、账单管理

| 任务 | 范围 | 工作量 |
|------|------|--------|
| P3-1 | Prisma Schema 扩展（Order + PaymentProvider） | 0.5d |
| P3-2 | 后端：Stripe 集成（Checkout Session + Webhook） | 2d |
| P3-3 | 后端：支付宝集成（预下单 + 回调） | 2d |
| P3-4 | 后端：订单状态机 + 发票管理 | 1.5d |
| P3-5 | 前端：购物车 `/marketplace/cart` | 1.5d |
| P3-6 | 前端：支付回调页 + 支付状态轮询 | 1d |
| P3-7 | 前端：账单管理 `/profile/billing` | 1.5d |
| P3-8 | Admin：订单管理 + 收入分析仪表盘 | 1.5d |

### Phase 4 — ISV 生态（Sprint 27-28，2周）

**目标**：ISV 可提交应用、管理版本、查看收入

| 任务 | 范围 | 工作量 |
|------|------|--------|
| P4-1 | 后端：ISV 注册与认证流程 | 1.5d |
| P4-2 | 后端：应用版本管理 API | 1.5d |
| P4-3 | 后端：ISV 收入报表 API | 1d |
| P4-4 | 前端：ISV 控制台（应用提交/版本/收入） | 3d |
| P4-5 | 前端：评价互动（官方回复） | 1d |
| P4-6 | Admin：ISV 管理 + 分成结算 | 1.5d |

---

## 九、技术决策说明

### 9.1 为什么不用现有 CMS 模块扩展？

现有 CMS 模块（`cms-generic`）适合内容型数据（文章、配置），但 Marketplace 涉及：
- 复杂的交易状态机（订单/支付/订阅）
- 外部系统集成（Stripe/支付宝）
- 实时性要求高的库存/价格计算
- 多角色权限（ISV / 企业 / 平台运营）

这些特性超出 CMS 通用 CRUD 的适用范围，独立模块更利于维护。

### 9.2 支付优先 Stripe 还是国内渠道？

**策略：双轨并行，但 Phase 3 优先 Stripe**

理由：
- Stripe 提供完整的 Checkout Hosted Page + Subscription 生命周期管理，MVP 阶段最快
- 支付宝/微信支付在 Phase 3 同步接入，覆盖国内企业客户
- 对公转账作为大额兜底方案

### 9.3 购物车是否需要持久化？

**决策：Workspace 级别 Redis 购物车，不持久化到 PostgreSQL**

理由：
- B2B 采购决策周期长，但 Marketplace 场景更偏向「即时订阅」
- Redis 购物车支持 TTL（7天自动过期），足够覆盖决策周期
- 降低数据复杂度，避免购物车与订阅模型的状态同步问题

---

## 十、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 支付牌照合规 | 中 | 高 | 优先接入 Stripe（持牌），国内支付使用聚合支付服务商 |
| ISV 入驻冷启动 | 高 | 高 | Phase 1 先用自研应用填充（10+），同时启动 ISV 招募 |
| 与现有 Workspace Plan 冲突 | 中 | 中 | Marketplace 订阅独立于 Workspace Plan，但可设置 Plan 折扣 |
| 应用集成复杂度 | 中 | 中 | Phase 1 仅支持 OAuth/SSO 集成，SDK/iFrame 延后 |

---

*文档版本: v1.0.0 | 规划人: AI Architecture Agent | 日期: 2026-06-09*
