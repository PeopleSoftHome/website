# TalentPro HR Portal — 产品规划和项目管理说明书

> **版本**：v4.3.0 | **状态**：已批准 | **适用范围**：TalentPro HR 门户全栈项目全周期
>
> **基于模板**：产品规划和项目管理说明书 v1.1.0
> **最后更新**：2026-07-05

---

## 目录

1. [产品基本信息](#1-产品基本信息)
2. [产品描述](#2-产品描述)
3. [产品类型](#3-产品类型)
4. [产品定位](#4-产品定位)
5. [产品目标](#5-产品目标)
6. [市场分析](#6-市场分析)
7. [对标构建](#7-对标构建)
8. [项目团队](#8-项目团队)
9. [项目管理](#9-项目管理)
10. [项目协作模式](#10-项目协作模式)
11. [核心理念【必须遵守】](#11-核心理念必须遵守)
12. [附录：文档规范与模板索引](#12-附录文档规范与模板索引)

---

## 1. 产品基本信息

| 字段 | 内容 |
|------|------|
| **产品名称** | TalentPro HR Portal |
| **英文名称** | TalentPro — Enterprise HR SaaS Marketing Portal |
| **产品 Logo** | 文字 Logo：渐变色「TalentPro」（`--grad-text: 135deg, #60A5FA → #A78BFA`） |
| **版本号** | v4.3.0（当前稳定版本） |
| **文档创建日期** | 2026-03-15 |
| **文档最后更新** | 2026-07-05 |
| **产品负责人** | Product Owner（人类） |
| **文档状态** | 已批准 |

---

## 2. 产品描述

### 2.1 一句话描述（Elevator Pitch）

> TalentPro HR Portal 是面向中大型企业的一体化 HR SaaS 平台官方营销门户 + 应用市场 + 管理后台，通过清晰的产品矩阵展示、AI 差异化优势呈现、规模化社会证明与自助交易能力，驱动企业 HR 决策者完成「预约演示」这一核心转化行为。

### 2.2 详细描述

TalentPro HR Portal 的核心用户是企业 CHRO/HR 总监、HRIS 专员、业务负责人及 IT/采购团队。他们在评估 HR SaaS 方案时，需要快速判断平台能力覆盖度、行业适配性和供应商可信度。门户网站是完成这一认知建立的第一触点。

产品的核心价值主张在于以「叙事路径」驱动转化：从 Hero 区建立品牌权威感，到产品矩阵传递全链路能力，再到 AI Family 专区呈现技术差异化，最终以行业方案、客户证言、量化数据多维度建立信任，引导用户完成预约演示。与同类竞品相比，差异化在于深度的 AI 能力展示（10 大 AI Agent、18 大角色工作台）和强数字锚定策略（6000+ 客户、15 亿+ 日数据条数等）。

`v4.1.0` 起产品形态从纯营销门户演进为「获客 + 自助交易」混合形态：应用市场（Marketplace）支持第三方应用展示、购买与订阅，支付模块支持 Stripe/支付宝，购物车基于 Redis 实现。`v4.3.0` 进一步引入 AI 图片生成与 Admin 配置智能化，使运营后台具备 AI 辅助内容生产能力。

产品主要功能模块涵盖：
- **营销门户首页**：顶部导航（含 Mega 菜单）、Hero 主视觉区、品牌滚动栏、核心统计数据区、产品矩阵 Tab、AI Family 专区、行业解决方案 Tab、客户证言轮播、客户 Logo 墙（含筛选）、「为什么选我们」、资源中心、底部 CTA 通栏、页脚、浮动操作栏、预约演示弹窗（3 步表单）。
- **二级页面**：产品列表/详情、解决方案列表/详情、客户案例列表/详情、资源中心列表/详情、新闻列表/详情、招聘（社会/校园/职位详情）、关于我们/团队/联系/合作伙伴、博客列表/详情、论坛话题列表/详情、个人中心、应用广场列表/详情、支付成功/取消页。
- **管理后台**：Dashboard、博客/论坛/案例/新闻/产品/方案管理、CMS 页面与 Section 配置、导航/翻译/站点配置、应用市场（应用/分类/厂商/评价/订单/订阅/收入分析）、用户/角色/权限、A/B 实验、Feature Flag、审计日志、敏感词、下载留资、媒体库等 38+ 视图。
- **后端 API**：基于 NestJS 11 + Prisma 6，覆盖认证授权（JWT + RBAC）、CMS、博客/论坛、线索、分析、Marketplace、支付、购物车、AI 生成、系统配置等 27 个业务模块。

用户体验的情感目标是：访客进入门户时感受到「这是一家技术实力强、服务经验丰富、在我行业有成功案例的头部 HR SaaS 供应商」，从而以较低的决策摩擦完成预约演示或在应用市场自助下单。

### 2.3 产品愿景（Vision）

> 成为中国企业级 HR SaaS 领域最具说服力的数字门户标杆，让每一位访问者在 3 分钟内完成从「陌生访客」到「意向留资」的转变。

### 2.4 产品使命（Mission）

> 通过精准的信息架构设计、高质量的技术实现与数据驱动的运营能力，消除企业 HR 采购决策中的信息不对称，让 TalentPro 的产品能力、行业经验和客户成就以最高效的方式触达每一个潜在客户。

---

## 3. 产品类型

| 类型分类 | 子类型示例 | 本产品选择 |
|----------|-----------|-----------|
| 企业级门户 | OA 门户、员工服务平台、数字化工作台 | ✅ **营销门户（Marketing Portal）** |
| 财务系统 | ERP 财务模块、报销系统、账款管理 | — |
| 电商平台 | B2C 商城、B2B 采购平台、跨境电商 | ✅ **B2B 应用市场（Marketplace）** |
| 社交与协作 | 即时通讯、项目协作、社区平台 | ✅ **论坛社区（Forum）** |
| 数据与分析 | BI 平台、数据中台、报表系统 | ✅ **营销数据分析（Analytics）** |
| AI 应用 | AI Agent、智能助手、AI 工作流 | ✅ **AI 能力展示层 + AI 内容生成（AI Showcase / AI Ops）** |
| 内容管理 | CMS、知识库、文档协作 | ✅ **资源中心 + CMS 运营后台（Content Hub）** |
| 其他 | SaaS 转化漏斗驱动型落地页 | ✅ |

**选定类型说明**：

> 本产品属于企业级 B2B 营销门户，以「预约演示」为唯一北极星转化目标，同时内嵌应用市场、AI 能力展示专区、资源中心和论坛社区四个次级功能层。技术实现为 Nuxt 3 SSG 静态营销门户 + NestJS 11 API + Vue 3 Element Plus 管理后台三层分离架构，具备工程可维护性、SEO 友好性与持续迭代能力。

---

## 4. 产品定位

### 4.1 核心定位声明

> TalentPro HR Portal 是由 AI Agent 团队全程驱动构建的企业级营销门户 + 应用市场 + 管理后台产品。从产品规划、设计系统重建、架构设计到代码实现，全程由 AI Agent 团队协作完成，Product Owner 负责需求输入与每个 Sprint 的验收确认。

### 4.2 AI 驱动模式说明

| 阶段 | 执行方式 | 人工介入点 |
|------|----------|-----------|
| 需求分析与 PRD 生成 | AI 产品经理 Agent 基于现有 PRD 深度扩展 | 重构方向确认、优先级确认 |
| UI/UX 设计规范 | AI 设计师 Agent 基于现有设计系统维护 Design Token | 视觉风格偏好、组件验收 |
| 系统架构设计 | AI 架构师 Agent 设计 Nuxt/NestJS/Vue 三层架构 | 技术栈确认、ADR 评审 |
| 功能开发 | AI 全栈开发 Agent 按 Sprint 编码 | 每 Sprint 预览验收 |
| 测试验证 | AI 测试 Agent 生成用例并执行 | 测试报告审阅 |
| 部署交付 | SSG 静态站点构建 + Docker/CDN 部署方案 | 生产环境发布授权 |

### 4.3 目标用户画像

```
用户画像 A：企业 CHRO / HR 总监（主决策者）
- 角色：人力资源一把手，掌握 HR 系统采购决策权
- 痛点：
  1. 难以快速判断某款 HR SaaS 能否覆盖集团全链路业务需求
  2. 担心更换系统导致的实施风险和员工适应成本
  3. 需要向 CEO/CFO 汇报采购 ROI，缺乏量化数据支撑
- 使用场景：在初步调研阶段快速浏览门户，判断是否值得深入了解
- 技术能力：初级（关注解决方案，不关注技术细节）

用户画像 B：HRIS 专员（技术评估者）
- 角色：负责具体系统调研对比，向 CHRO 提供选型建议
- 痛点：
  1. 需要评估系统技术先进性（AI 能力、API 开放性、数据安全合规）
  2. 担心 SaaS 系统与现有 OA/ERP 集成复杂度高
  3. 希望了解同行业的落地案例和实施周期
- 使用场景：深度浏览产品矩阵、AI 专区、行业方案，下载白皮书
- 技术能力：中级

用户画像 C：业务负责人（效率关注者）
- 角色：招聘、培训等具体 HR 业务模块负责人
- 痛点：现有工具效率低下，招聘/培训流程中存在大量手工操作
- 使用场景：通过行业解决方案和客户证言验证产品可用性
- 技术能力：初级

用户画像 D：IT / 采购（合规把关者）
- 角色：负责系统安全合规审查和商务谈判
- 痛点：数据安全、等保合规、价格透明度
- 使用场景：通过页脚、「为什么选我们」区获取安全认证信息
- 技术能力：中高级

用户画像 E：应用市场买家（PLG 自助用户）
- 角色：希望快速试用/购买 HR 生态插件的 HR 业务人员或 IT 管理员
- 痛点：
  1. 缺乏集成到主系统的应用发现渠道
  2. 订阅与支付流程不透明
  3. 担心第三方应用数据安全
- 使用场景：浏览应用广场、查看评价与兼容性、下单订阅
- 技术能力：中级
```

---

## 5. 产品目标

### 5.1 北极星指标（North Star Metric）

> **月度预约演示提交量（Monthly Demo Bookings）** — 反映门户核心转化价值的唯一度量指标。

### 5.2 次要指标

| 指标 | 说明 | 优先级 |
|------|------|--------|
| Marketplace 月度交易额（GMV） | 应用市场自助交易规模 | P1 |
| 月度内容下载留资量 | 白皮书/案例/资源下载带来的线索数 | P1 |
| 月度注册用户数 | 论坛/个人中心注册，反映社区与 PLG 健康度 | P2 |
| 博客/案例自然搜索流量 | SEO 内容营销效果，验证 SSG 真实预渲染收益 | P1 |
| 首页到 DemoModal 的转化率 | 漏斗核心节点效率 | P1 |
| 应用市场详情页到下单转化率 | 自助交易漏斗效率 | P2 |

### 5.3 阶段性目标（OKR 框架）

#### Phase 1 — Nuxt 3 迁移与全栈基线（里程碑：`2026-05-30`，v4.0.0）

| # | Objective | Key Result | 度量方式 |
|---|-----------|-----------|---------|
| O1 | 完成从 Vite SPA 到 Nuxt 3 SSG 的迁移 | KR1：全部页面迁移为 Nuxt 文件路由 | 功能 Checklist 验收 |
|   |            | KR2：20+ 路由成功预渲染为静态 HTML | 构建产物检查 |
|   |            | KR3：i18n / Pinia / PWA 模块正式启用 | 代码审查 |
| O2 | 建立可持续迭代的工程基础 | KR1：前端 TypeScript 严格模式全量迁移 | CI 类型检查 |
|   |            | KR2：组件按 `layout/sections/ui` 分层 | 代码结构审查 |

#### Phase 2 — Marketplace / Payment / Cart + 技术债务清零（里程碑：`2026-06-09`，v4.1.0）

| # | Objective | Key Result | 度量方式 |
|---|-----------|-----------|---------|
| O1 | 上线应用市场与自助交易能力 | KR1：应用广场列表/详情页上线 | 功能验收 |
|   |            | KR2：Stripe / 支付宝支付闭环跑通 | 支付 E2E 验收 |
|   |            | KR3：Admin 应用/分类/厂商/订单/订阅视图可用 | 管理后台验收 |
| O2 | 清零历史高优先级技术债务 | KR1：P0 安全红线全部关闭 | 安全审计 |
|   |            | KR2：`@typescript-eslint/no-explicit-any` 清零 | lint 报告 |

#### Phase 3 — 运营智能化与配置化（里程碑：`2026-07-05`，v4.3.0）

| # | Objective | Key Result | 度量方式 |
|---|-----------|-----------|---------|
| O1 | 降低运营发版依赖 | KR1：导航/页脚/站点配置 CMS 化 | 运营验收 |
|   |            | KR2：Hero 等首页 Section 支持后台配置 | 配置化验收 |
| O2 | 提升 AI 辅助运营效率 | KR1：AI 内容生成端点覆盖 blog/product/seo/translate/moderate | API 测试 |
|   |            | KR2：AI 图片生成与 Admin 配置助手上线 | Admin 验收 |
| O3 | 修复架构级缺陷 | KR1：SSR/SSG 真实预渲染恢复 | 原始 HTML 抓取测试 |
|   |            | KR2：BullMQ Redis HA 与文档一致 | 故障切换演练 |

### 5.4 成功标准（Definition of Done）

- [x] 全部 P0 功能在 v4.3.0 已完成，无功能回退
- [x] 首屏加载 < 2s，Lighthouse Performance ≥ 90
- [x] 全量响应式测试通过（375 / 768 / 1024 / 1440px）
- [x] 无 P0/P1 级未修复缺陷
- [x] 组件拆分规范：Section ≤ 150 行、子组件 ≤ 80 行、UI 原子 ≤ 60 行
- [x] 设计 Token 文件完整（`src/tokens/index.ts` + `:root` CSS 变量）
- [x] 前端 TypeScript 严格模式全量通过
- [x] WCAG 2.1 AA 无障碍基础合规（alt 文字、键盘导航），`color-contrast` 规则已重新启用并通过全项目 E2E
- [x] CHANGELOG.md 变更记录完整
- [x] Product Owner 验收通过

---

## 6. 市场分析

### 6.1 市场规模与趋势

```
TAM（总可寻址市场）：中国 HR SaaS 市场，2025 年规模约 150 亿人民币
SAM（可服务市场）：中大型企业（500人以上）HR 数字化解决方案市场，约 80 亿
SOM（可获得市场）：具备 AI 能力差异化的一体化 HR SaaS，目标占有率 8~12%

市场增长率：CAGR ≈ 22%（2024-2028），预计 2028 年突破 300 亿
核心驱动力：
  - AI 大模型驱动 HR 场景革新（AI 面试官、AI 招聘助手等成熟落地）
  - 企业降本增效压力加剧，HR 数字化从"可选"变"必选"
  - 国家数据安全法规推动企业向合规 SaaS 迁移
  - 新一代 HR 管理者（30-40 岁）对数字化工具接受度显著提升

主要风险：
  - 头部厂商（北森、Workday、SAP）市场防御壁垒强，中小客户竞争激烈
  - AI 能力同质化风险：大模型能力趋于开放，差异化窗口期有限
  - 企业 IT 预算收紧可能延缓大型项目决策周期
  - HR SaaS + 应用市场模式可能引入电商级合规与对账复杂度
```

### 6.2 竞品分析矩阵

| 竞品名称 | 定位 | 核心优势 | 核心劣势 | 市场份额 | 用户口碑 |
|---------|------|---------|---------|---------|---------|
| 北森 iTalentX | 中大型企业 HR SaaS 龙头 | IDC 连续第一、产品成熟度高、生态完善 | 价格较高、实施周期长 | ~18% | ⭐⭐⭐⭐ |
| Moka | 互联网企业招聘 SaaS | 招聘模块体验出色、AI 能力强 | 覆盖模块有限（非全链路） | ~8% | ⭐⭐⭐⭐⭐ |
| SAP SuccessFactors | 大型跨国企业 HCM | 国际化能力、ERP 集成强 | 本土化不足、价格昂贵 | ~6% | ⭐⭐⭐ |
| Workday | 全球 HCM 标杆 | 产品先进性、UX 体验 | 中国市场覆盖弱、本土化差 | ~3% | ⭐⭐⭐⭐ |
| 薪人薪事 | 中小企业 HR SaaS | 价格低、部署快 | 功能深度不足，不适合中大型企业 | ~5% | ⭐⭐⭐ |
| **TalentPro** | 中大型企业一体化 HR SaaS + AI 差异化 + B2B 应用市场 | 10 大 AI Agent、全链路覆盖、行业方案深度、自助交易能力 | 品牌认知度待提升、Marketplace 复杂度管理 | 成长期 | — |

### 6.3 差异化竞争策略

```
核心差异化点（USP）：
1. AI Native 优先：相比传统 HR SaaS，TalentPro 以 AI Family（招聘/面试/学习/领导力 AI Agent）
   为核心卖点，而非将 AI 作为附加功能
2. 全链路覆盖：招聘 → 绩效 → 薪酬 → 学习 → 盘点的完整链路，避免企业多系统割裂
3. 行业深度方案：制造业/零售/互联网/央国企/金融五大垂直行业定制化方案，
   对比北森的通用方案有更强的行业说服力
4. 数字锚定策略：6000+ 客户、20+ 年专业沉淀、IDC 连续九年第一等权威数据支撑
5. PLG 自助交易：应用市场 + 支付订阅，使中小团队可自助接入生态能力

竞争护城河：
- 数据壁垒：15 亿+日数据条数积累的 AI 训练语料
- 行业壁垒：20+ 年制造业、零售等传统行业深度积累
- 生态壁垒：200+ 生态伙伴、1100+ BCA 认证顾问网络
- 技术壁垒：10 大 AI Agent 产品矩阵，研发护城河深
```

### 6.4 发展趋势研判

```
短期趋势（1 年）：
  - AI 面试官、AI 做课助手等 AI 工具从演示 Demo 走向规模化商用
  - 企业客户要求 HR SaaS 提供数据安全本地化部署选项
  - 营销门户 SEO 真实预渲染成为 B2B 获客标配

中期趋势（3 年）：
  - HR SaaS 从工具层向「决策智能层」演进（Agentic HR），
    门户需要展示 AI 决策能力而非仅工具能力
  - 移动端成为 HR SaaS 主战场，门户移动体验权重提升
  - B2B 应用市场分账与生态运营成为新收入增长点

长期趋势（5 年）：
  - HR SaaS 与企业数据中台深度集成，采购方更关注数据互通能力
  - 个性化营销门户（基于访客行业/规模动态展示内容）成为标配
  - 多 LLM Provider 与私有化模型部署成为大企业合规刚需
```

---

## 7. 对标构建

### 7.1 用户输入素材（已提供）

| 素材类型 | 内容 | 用途 |
|---------|------|------|
| 原始 Demo HTML | `TalentPro_demo_v1_2_0.html` | 早期功能基线、视觉参考、交互逻辑（已归档） |
| 当前代码库 | `src/` / `talentpro-backend/` / `talentpro-admin/` | 真实实现参考与架构约束 |
| 架构诊断报告 | `architecture-diagnosis-report-v4.3.0.md` | 风险登记册与改进建议依据 |
| 项目模板 | `产品规划和项目管理说明书_v1_1.md` | 企业级文档规范模板 |

### 7.2 成熟产品对标

```
1. 北森 iTalentX（beisen.com）
   - 学习维度：信息架构、行业方案展示方式、导航下拉菜单设计
   - 参考链接：https://www.beisen.com
   - 提炼要点：行业 Tab 切换模式、客户 Logo 墙布局、数字统计区排版

2. Workday（workday.com）
   - 学习维度：企业级 SaaS 门户的视觉权威感、Hero 区设计语言
   - 参考链接：https://www.workday.com
   - 提炼要点：深色 Hero + 产品截图浮动展示、AI 功能专区设计风格

3. Linear（linear.app）
   - 学习维度：现代企业级 SaaS 落地页的高质量设计标准
   - 参考链接：https://linear.app
   - 提炼要点：渐变动效、排版密度控制、玻璃态卡片设计

4. Notion（notion.so）
   - 学习维度：内容模块的信息组织方式、资源中心展示
   - 参考链接：https://www.notion.so
   - 提炼要点：卡片组件规范、Tag 系统设计、CTA 按钮策略

5. Shopify App Store
   - 学习维度：B2B 应用市场列表/详情/评价/支付闭环
   - 参考链接：https://apps.shopify.com
   - 提炼要点：应用卡片信息架构、定价方案切换、评价星级展示
```

### 7.3 优秀开源项目对标

| 项目名称 | Stars | 技术栈 | 学习重点 | 链接 |
|---------|-------|-------|---------|------|
| `nuxt` | 55k+ | Vue + Nitro | SSG/SSR 最佳实践、文件路由、自动导入 | https://github.com/nuxt/nuxt |
| `nestjs` | 70k+ | TypeScript + Node.js | 模块化架构、DI/IOC、企业级 API 设计 | https://github.com/nestjs/nest |
| `element-plus` | 25k+ | Vue 3 | 管理后台组件规范 | https://github.com/element-plus/element-plus |
| `bullmq` | 10k+ | Redis + TypeScript | 队列任务与高可用设计 | https://github.com/taskforcesh/bullmq |

### 7.4 联网搜索对标（待执行/持续更新）

- [ ] 搜索北森最新官网改版内容（近 3 个月）
- [ ] 搜索 Dribbble HR SaaS Landing Page 最新设计趋势
- [ ] 搜索 Nuxt 3 企业级营销官网 SEO 最佳实践（2026）
- [ ] 搜索 WCAG 2.1 AA 合规关键要求清单
- [ ] 搜索 B2B SaaS Marketplace 支付与分账最佳实践

---

## 8. 项目团队

### 8.1 团队结构

```
Product Owner（人类）
        │
        ▼
┌──────────────────────────────────────────────────────┐
│              项目经理 Agent (PM)                       │
│    负责迭代计划、进度管控、Token 预算、风险管理           │
└──────────────────┬───────────────────────────────────┘
                   │
       ┌───────────┼──────────────┬──────────────┐
       ▼           ▼              ▼              ▼
  产品经理       架构师        前端设计师      测试专家
  Agent          Agent          Agent          Agent
                   │
                   ▼
             全栈开发 Agent
```

### 8.2 角色职责说明

#### 🗂️ 项目经理 Agent
- 制定并维护迭代计划（`project-plan.md` + `sprint-N-plan.md`）
- 按模块边界分解 WBS，控制每 Sprint ≤ 3 个模块
- **必须**在每份 Sprint 计划中执行 Token 预算评估
- 维护风险登记册（`risk-register.md`）和变更日志（`CHANGELOG.md`）

#### 📋 产品经理 Agent
- 维护 `prd.md` 为唯一真相来源，覆盖营销门户、Marketplace、AI 功能
- 按「产品 → 模块 → 子模块 → 功能点」层级结构梳理功能清单
- 管理功能优先级（P0/P1/P2）

#### 🏛️ 架构师 Agent
- 设计 Nuxt 3 SSG 营销门户 + NestJS 11 API + Vue 3 Admin 三层架构
- 定义设计 Token 工程化方案（CSS 变量 + TS 常量）
- 输出 `architecture.md`（含前后端架构、ADR、部署方案）

#### 🎨 前端设计师 Agent
- 维护 `design-system.md`
- 输出 `src/tokens/index.ts`（色彩/字体/间距/圆角/阴影/动效）
- 制定组件规范文档（`component-spec.md`）

#### 🏗️ 全栈开发 Agent
- 按 Sprint 计划完成 Nuxt 页面/组件、NestJS API、Admin 视图开发
- 遵循架构师设计的目录结构和命名规范
- 每 Sprint 完成后输出可运行预览版本

#### 🔬 测试专家 Agent
- 基于功能 Checklist 编写测试用例（视觉/交互/响应式/跨浏览器/单元/E2E）
- 执行每 Sprint 的功能回归测试
- 输出 `test-report.md`

### 8.3 RACI 责任矩阵

| 活动 | Product Owner | PM Agent | 产品经理 Agent | 架构师 Agent | 设计师 Agent | 开发 Agent | 测试 Agent |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 重构需求确认 | **A** | C | R | I | I | I | I |
| PRD 扩展更新 | I | C | **R** | C | C | I | I |
| Nuxt/NestJS 架构设计 | I | I | C | **R** | I | C | I |
| 设计 Token 维护 | I | I | C | C | **R** | I | I |
| Sprint 计划制定 | A | **R** | C | C | C | C | C |
| 组件/API/Admin 开发 | I | I | I | C | C | **R** | I |
| 测试执行 | I | I | I | I | I | C | **R** |
| Sprint 验收 | **A** | R | C | I | I | I | C |
| 版本发布 | **A** | R | I | C | I | C | C |

---

## 9. 项目管理

### 9.1 项目推进模式

本项目为**场景 B：需求迭代 / 重构 + 持续运营增强**，采用「文档先行 + 敏捷 Sprint」混合模式。

```
当前代码库基线分析
    │
    ▼
架构设计（Nuxt 3 SSG + NestJS 11 + Vue 3 Admin）
    │
    ▼
设计系统维护（Design Token）
    │
    ▼
Sprint 1：工程初始化 + 核心布局组件（导航/Hero/页脚）
    │
    ▼
Sprint N：按 Section/模块/后端 API/Admin 视图逐步迁移与增强
    │
    ▼
运营配置化迭代（v4.2.x ~ v4.3.x：CMS 化、AI 辅助运营）
    │
    ▼
GA 发布与持续优化
```

### 9.2 迭代规范

| 规范项 | 说明 |
|-------|------|
| Sprint 周期 | 每次对话为一个原子任务，多次对话组成一个 Sprint |
| Sprint 启动 | 项目经理 Agent 发布 `sprint-N-plan.md` 并经 PO 确认后开始 |
| Sprint 粒度 | 每个 Sprint 聚焦 ≤ 3 个 Section 组件或 1–2 个后端/Admin 模块 |
| Sprint 中断条件 | 组件样式严重偏离设计规范、响应式重大缺陷、架构级安全/可用性缺陷 |
| Sprint 完成条件 | 全部 P0 功能完成 + 响应式测试通过 + 单元/E2E 新增用例通过 + PO 预览确认 |

### 9.3 版本管理规范

| 版本类型 | 格式 | 触发条件 |
|---------|------|---------|
| 主版本（Major） | v**X**.0.0 | 架构级重构或重大产品形态变化 |
| 次版本（Minor） | v4.**X**.0 | 新 Section、新模块、新能力（Marketplace、AI 图片生成等） |
| 补丁版本（Patch） | v4.3.**X** | Bug 修复、文案/样式小优化、安全补丁 |

**当前版本映射关系**：

| 版本 | 发布日期 | 对应内容 |
|------|---------|---------|
| v4.0.0 | 2026-05-30 | Nuxt 3 迁移完成，SSG 基线 |
| v4.1.0 | 2026-06-09 | Marketplace / Payment / Cart + 技术债务清零 |
| v4.2.0 | 2026-06-15 | JWT Cookie-only、导航 CMS 化、功能开关、AI 内容生成、翻译后端化 |
| v4.3.0 | 2026-07-05 | AI 图片生成、Admin 配置智能化、SSR/SSG 修复、文档同步 |

**版本号治理**：
- 三个子项目 `package.json` 版本号必须与 CHANGELOG/Git tag 保持一致
- 每次发布前运行 `npm run validate:versions`（`scripts/validate-version-sync.cjs`）校验根目录、`talentpro-backend`、`talentpro-admin` 三者一致性

### 9.4 Token 预算规范

| 场景 | 注入上下文 | 预估输入 Token | 原则 |
|-----|-----------|-------------|------|
| 单 Section 组件开发 | design-system.md + 该 Section PRD 章节 | ≈ 8,000~15,000 | ✅ 正常 |
| 多 Section 批量开发（≤3个）| design-system.md + 对应 PRD 章节 | ≈ 20,000~40,000 | ✅ 正常 |
| 单后端模块开发 | architecture.md + 对应模块 DTO/Service 规范 | ≈ 15,000~30,000 | ✅ 正常 |
| 整站重构（含全量组件）| 全量 PRD + 全量代码 | ≈ 100,000+ | ❌ 必须拆分 |

**拆分规则**：预估输入 > 60K tokens 的任务必须拆分为独立 Sprint 子任务。

---

## 10. 项目协作模式

### 10.1 重构/迭代项目协作流程

```
STEP 1：架构师 Agent
  输入：当前代码库 + PRD + 本说明书
  执行：分析现有代码 → 设计 Nuxt/NestJS/Vue 三层拆分方案 → 定义目录结构
  输出：architecture.md（组件树 + 目录结构 + 技术选型 + ADR）
  验收：PO 确认技术方案

STEP 2：设计师 Agent
  输入：PRD（设计系统章节）+ 对标参考
  执行：提炼设计 Token → 维护 design-system.md → 输出/维护 src/tokens/index.ts
  输出：design-system.md + tokens
  验收：PO 确认设计系统

STEP 3：项目经理 Agent
  输入：architecture.md + design-system.md + 待办 Bug/功能清单
  执行：Sprint 规划 → Token 预算评估 → 优先级排序
  输出：project-plan.md（总计划）+ sprint-N-plan.md
  验收：PO 批准开始开发

STEP 4~N：全栈开发 Agent（循环）
  每 Sprint 聚焦 ≤ 3 个 Section 组件或 1–2 个后端/Admin 模块
  完成后提交预览 → PO 验收 → 下一 Sprint

STEP N+1：测试 Agent
  并行执行测试用例（响应式 + 交互 + 视觉回归 + 单元 + E2E）
  输出 test-report.md
  PO 审阅通过后发布
```

### 10.2 文档更新规范

每次迭代执行时，**必须**：
1. 在 `prd.md` 对应章节追加或更新内容（不覆盖原有内容，除非明确重构）
2. 更新文档顶部版本号和最后修改日期
3. 在 `CHANGELOG.md` 记录变更摘要
4. 同步更新 `risk-register.md`（如引入新风险）与 `project-spec.md`（如目标/阶段变更）
5. 重大变更通知 Product Owner 确认

---

## 11. 核心理念【必须遵守】

### 11.1 🎯 设计驱动（Design First）

```
✅ 正确：design-system.md 完成并经 PO 确认 → 才开始组件开发
❌ 错误：直接写组件 → 后补设计规范
```

> 没有完整的 Design Token 文件，开发 Agent 不得开始编写组件 CSS。

### 11.2 📄 文档驱动（Documentation First）

```
✅ 正确：prd.md 是唯一真相来源，组件行为与 PRD 规范保持同步
❌ 错误：组件实现后才更新 PRD / PRD 与实现不一致
```

### 11.3 🔭 对标驱动（Benchmark First）

```
✅ 正确：每个组件/模块开发前，参考对标产品的同类实现
❌ 错误：凭空设计组件
```

### 11.4 📅 计划驱动（Plan First）

```
✅ 正确：sprint-N-plan.md 经 PO 确认后开始开发
❌ 错误：没有 Sprint 计划就开始编码
```

### 11.5 🔄 流程驱动（Process First）

```
架构师 → 设计师 → 项目经理 → 开发（循环 Sprint）→ 测试 → 验收 → 下一迭代
```

### 11.6 🏷️ 版本管理

```
✅ 每个 Sprint 对应一个版本标签（v4.3.x）
✅ 每次 Sprint 完成有对应发布记录（CHANGELOG.md）
✅ 任何时刻可回滚到上一稳定 Sprint 版本
✅ 三个子项目 package.json 版本号保持一致
❌ 没有 Sprint 计划确认就开始开发
❌ package.json 与 CHANGELOG 版本号不一致就发布
```

### 11.7 🏢 企业级标准

| 维度 | 标准要求 |
|------|---------|
| **代码质量** | 组件单一职责，Section ≤ 150 行、子组件 ≤ 80 行、UI 原子 ≤ 60 行 |
| **性能** | LCP < 2.5s，Lighthouse Performance ≥ 90 |
| **可用性** | 响应式 4 断点完整支持（375/768/1024/1440px），键盘可导航 |
| **可维护性** | 组件命名语义化，Props 有 TypeScript 类型 |
| **无障碍** | alt 文字完整、focus 状态可见、色彩对比度持续整改 |
| **文档** | 每个组件有简要注释说明 Props 和使用场景 |

### 11.8 🧩 模块化开发（组件化优先）

```
页面（Page）
  └── Section（区块，如 HeroSection / ProductMatrixSection）
        └── 子组件（如 ProductCard / TabNav / CarouselDots）
              └── 原子组件（如 Button / Tag / Badge）
```

**组件独立性要求**：
- 每个 Section 组件独立文件，无跨 Section 直接引用
- 共享逻辑抽取至 `composables/` 或 `utils/`
- 设计 Token 统一从 `src/tokens/index.ts` 导入，不散落在各组件内

### 11.9 🔬 最小化迭代

```
✅ 修复轮播 Resize Bug：只修改 useCarousel composable 中的计算逻辑
✅ 新增 SVG 图标：只更新 ProductCard 组件的 icon prop
❌ 修复一个 Bug 时顺带重构整个 Section 组件
❌ 每次迭代传入全量代码库要求 Agent 重新理解整个项目
```

---

## 12. 附录：文档规范与模板索引

### 12.1 核心文档清单

| 文档名称 | 路径 | 负责角色 | 状态 |
|---------|------|---------|------|
| 产品规划和项目管理说明书 | `docs/project-spec.md` | 全团队 | ✅ 本文档 |
| 产品需求文档 | `docs/prd.md` | 产品经理 Agent | ✅ 已同步 v4.3.0 |
| 系统架构文档 | `docs/architecture.md` | 架构师 Agent | ✅ 已同步 v4.3.0 |
| 设计系统文档 | `docs/design-system.md` | 设计师 Agent | ✅ 已同步 |
| 设计 Token 文件 | `src/tokens/index.ts` | 设计师 Agent | ✅ 已同步 |
| 项目计划 | `docs/project-plan.md` | 项目经理 Agent | ✅ 已同步 |
| Sprint 计划 | `docs/sprints/sprint-N-plan.md` | 项目经理 Agent | 📋 按迭代维护 |
| 测试计划 | `docs/test-plan.md` | 测试 Agent | ✅ 已同步 |
| 风险登记册 | `docs/risk-register.md` | 项目经理 Agent | ✅ 已同步 v4.3.0 |
| 变更日志 | `CHANGELOG.md` | 项目经理 Agent | ✅ 已同步 |
| 项目说明 | `README.md` | 全栈开发 Agent | ✅ 已同步 |
| AI 助手指南 | `AGENTS.md` | 全团队 | ✅ 已同步 v4.3.0 |

### 12.2 文档目录结构

```
np-website/
├── README.md                    # 项目入口，开发者文档
├── CHANGELOG.md                 # 变更日志（Keep a Changelog 格式）
├── AGENTS.md                    # AI 助手指南与编码规范
├── docs/
│   ├── project-spec.md          # ✅ 本文档（产品规划和项目管理说明书）
│   ├── prd.md                   # 产品需求文档（唯一真相来源）
│   ├── architecture.md          # Nuxt/NestJS/Vue 三层架构 + 工程结构
│   ├── design-system.md         # 设计系统规范（色彩/字体/间距/组件）
│   ├── project-plan.md          # 总体迭代计划与里程碑
│   ├── risk-register.md         # 风险登记册
│   ├── test-plan.md             # 测试计划
│   ├── redis-meilisearch-ha.md  # Redis / Meilisearch 高可用方案
│   ├── sprints/                 # Sprint 计划
│   └── reports/                 # 测试/审计报告
├── src/                         # Nuxt 3 营销门户源码
│   ├── components/
│   │   ├── layout/              # NavBar / Footer
│   │   ├── sections/            # 首页 Section 组件
│   │   └── ui/                  # 原子组件（Button / Tag / Modal 等）
│   ├── composables/             # 自动导入的组合式函数
│   ├── pages/                   # Nuxt 文件路由
│   ├── stores/                  # Pinia 全局状态
│   ├── api/                     # 后端 API 封装
│   ├── data/                    # 静态 fallback 数据
│   ├── i18n/                    # 多语言 JSON
│   ├── tokens/                  # Design Token
│   └── styles/                  # 全局 CSS + 动画
├── talentpro-backend/           # NestJS 11 + Prisma 6 后端
│   ├── apps/api/src/            # 业务模块
│   ├── prisma/                  # Schema + Migrations
│   └── docker/                  # Dockerfile + docker-compose
└── talentpro-admin/             # Vue 3 + Vite + Element Plus 管理后台
    ├── src/
    │   ├── views/               # 38+ 管理视图
    │   └── components/          # CmsTable 等内部组件
    └── vite.config.js
```

### 12.3 遗留问题处理原则

> 以下原则用于处理历史版本（v1.2.0 及更早）遗留的 Demo HTML、旧路由、旧状态管理代码：

| ID | 处理原则 | 优先级 | 策略 |
|----|---------|-------|------|
| LEG-01 | 旧 Demo HTML 仅作为视觉参考，不再维护 | 🟢 P2 | 归档至 `docs/archive/` |
| LEG-02 | Vue 2 / 旧 Vite SPA 代码已迁移完毕，不再保留 | 🟢 P2 | 已在 v4.0.0 迁移中删除 |
| LEG-03 | 历史组件/hooks 若仍有引用，逐步替换为 Nuxt 3 组合式函数 | 🟡 P1 | 按模块迁移 |

---

> 📌 **维护规则**：
> 每次 Sprint 完成后，由项目经理 Agent 更新本文档第 9 章迭代状态和第 12.1 章文档清单状态。
> 重大架构或设计决策变更时，由对应 Agent 更新相关章节并通知 Product Owner 确认。

---

*TalentPro HR Portal — 产品规划和项目管理说明书 v4.3.0*
*基于企业级项目管理模板 v1.1.0 | 2026-07-05*
