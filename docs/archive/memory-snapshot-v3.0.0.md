# TalentPro — AI Agent 会话记忆存档

> **存档时间**: 2026-05-28 03:45 CST
> **当前阶段**: v3.0.0 二级页面扩展完成 | 前端 117 测试通过 | 后端运行中
> **上次会话主题**: 产品/解决方案/客户案例/资源中心/新闻/招聘/了解我们 全部二级页面重构与扩展

---

## 一、项目全景

### 1.1 项目结构

```
talentpro-v2/
├── src/                          # 前端 Vue3 SPA
│   ├── components/
│   │   ├── sections/             # 16 个首页 Section
│   │   ├── ui/                   # 原子组件 + 弹窗 + Breadcrumb
│   │   └── layout/               # NavBar + Footer
│   ├── composables/              # 12 个自定义 Composables
│   ├── stores/                   # provide/inject 状态管理
│   ├── api/                      # Axios API 客户端 + 模块
│   │   ├── client.js             # 基础实例
│   │   ├── blog.js / forum.js    # 内容社区
│   │   ├── case.js / news.js / careers.js / about.js  # 二级页面 API
│   │   └── cms.js / search.js / lead.js
│   ├── i18n/                     # 多语言系统（zh-CN/en/zh-TW，~450 keys）
│   ├── data/                     # 静态数据文件（新增/大幅扩展）
│   │   ├── products.js           # 20 产品，含 features/scenarios/testimonial/specs/related
│   │   ├── industries.js         # 5 行业方案，含 painPoints/architecture/roadmap/caseStudy/roi/stats
│   │   ├── cases.js              # 8 客户案例（前端 fallback 数据）
│   │   ├── resources.js          # 16 资源，新增 product-manual/troubleshooting/company-profile
│   │   ├── navigation.js         # 导航数据
│   │   └── ...
│   ├── pages/                    # 全部页面视图（21 个）
│   │   ├── HomePage.vue
│   │   ├── ProductListView.vue   # /products
│   │   ├── ProductDetailView.vue # /products/:slug
│   │   ├── SolutionListView.vue  # /solutions
│   │   ├── SolutionDetailView.vue# /solutions/:slug
│   │   ├── CaseListView.vue      # /cases
│   │   ├── CaseDetailView.vue    # /cases/:slug
│   │   ├── ResourceListView.vue  # /resources
│   │   ├── ResourceDetailView.vue# /resources/:slug
│   │   ├── NewsListView.vue      # /news
│   │   ├── NewsDetailView.vue    # /news/:slug
│   │   ├── CareersView.vue       # /careers
│   │   ├── CampusCareersView.vue # /careers/campus
│   │   ├── SocialCareersView.vue # /careers/social
│   │   ├── JobDetailView.vue     # /careers/:id
│   │   ├── AboutView.vue         # /about
│   │   ├── TeamView.vue          # /about/team
│   │   ├── ContactView.vue       # /about/contact
│   │   ├── PartnersView.vue      # /about/partners
│   │   └── BlogListView.vue / BlogDetailView.vue / ForumView.vue / ForumTopicView.vue / ProfilePage.vue
│   └── main.js                   # Vue3 入口
├── talentpro-backend/            # NestJS 后端
│   ├── apps/api/src/modules/     # 业务模块
│   ├── prisma/schema.prisma      # 数据库模型
│   └── docker/docker-compose.yml # 基础设施编排
├── talentpro-admin/              # 管理后台（独立项目）
├── docs/                         # 项目文档
├── dist/                         # 前端构建产物（PWA + Prerender）
└── package.json / vite.config.js
```

### 1.2 技术栈总览

| 层级 | 技术 | 状态 |
|------|------|------|
| 前端框架 | Vue 3.5 + Vite 8 | ✅ |
| 前端测试 | Vitest + @vue/test-utils | ✅ **117/117 通过** |
| 前端构建 | `npm run build` | ✅ 零警告 |
| 后端框架 | NestJS 11 + TypeScript 5 | ✅ 运行中 :4000 |
| ORM | Prisma 6 | ✅ |
| 数据库 | PostgreSQL 16 | ✅ Docker |
| 缓存 | Redis 7 | ✅ Docker |

---

## 二、v3.0.0 已完成工作（本次会话）

### 2.1 产品矩阵二级页面 ✅
- **数据**: `src/data/products.js` 扩展 20 个产品，新增 `features` / `scenarios` / `testimonial` / `specs` / `related`，导出 `PRODUCT_MAP`
- **列表页** `/products`: Tab 分类 + 产品卡片网格（图标/标签/描述/CTA）+ 底部 CTA 通栏
- **详情页** `/products/:slug`: Hero + 核心功能 4 宫格 + 应用场景 + 客户证言 + 技术规格 + 相关产品推荐

### 2.2 解决方案二级页面 ✅
- **数据**: `src/data/industries.js` 扩展 5 大行业，新增 `painPoints` / `architecture` / `roadmap` / `caseStudy` / `roi` / `stats`，导出 `INDUSTRY_MAP`
- **列表页** `/solutions`: 行业卡片（含关键指标）+ 底部 CTA
- **详情页** `/solutions/:slug`: Hero + 行业痛点 + 方案架构 + 核心能力 + 实施路径（4 阶段）+ 客户案例故事 + ROI

### 2.3 客户案例二级页面 ✅
- **数据**: 新建 `src/data/cases.js`，8 个高质量案例（蒙牛/海尔/苏宁/中国人保/国家电网/字节跳动/信达生物/京东方）
- **列表页** `/cases`: 行业筛选 + Featured 精选大图 + 案例网格，**API 失败时自动 fallback 到静态数据**
- **详情页** `/cases/:slug`: Hero + 核心指标 + 挑战/方案/成果 + 客户证言 + 使用产品，**支持 API fallback**

### 2.4 资源中心二级页面 ✅
- **数据**: `src/data/resources.js` 扩展至 16 条，新增分类 `product-manual` / `troubleshooting` / `company-profile`
- **列表页** `/resources`: 8 类标签筛选 + Featured 精选区 + 资源卡片网格
- **详情页** `/resources/:slug`: 类型标签 + 元信息 + 下载 CTA + 相关资源推荐

### 2.5 新闻中心 ✅
- **列表页** `/news`: Featured 新闻大图卡片 + 普通新闻网格
- **详情页** `/news/:slug`: 分类标签 + 作者/日期 + 封面图 + 段落化正文

### 2.6 加入我们 ✅
- **主页面** `/careers`: 校园/社会双通道入口 + 部门筛选职位列表 + 6 大福利展示
- **校园招聘** `/careers/campus`: 管培生/实习生/研究合作三大项目 + 校招职位
- **社会招聘** `/careers/social`: 开放文化/成长体系亮点 + 社招职位
- **职位详情** `/careers/:id`: 元信息标签 + 职位描述/任职要求/福利 + 申请按钮

### 2.7 了解我们 ✅
- **公司介绍** `/about`: 品牌故事 + 4 大数据 + 价值观 4 宫格 + 团队/伙伴/联系入口
- **团队介绍** `/about/team`: 成员头像网格（API 驱动）
- **合作伙伴** `/about/partners`: 伙伴 Logo 网格（API 驱动）
- **联系我们** `/about/contact`: 联系信息卡片 + 留言表单

### 2.8 国际化同步 ✅
- `zh-CN.json` / `en.json` / `zh-TW.json` 同步新增 30+ 二级页面专用 key

---

## 三、路由映射表

| 路径 | 页面组件 | 数据来源 |
|------|----------|----------|
| `/` | HomePage.vue | 静态数据 + API |
| `/products` | ProductListView.vue | `PRODUCT_TABS` |
| `/products/:slug` | ProductDetailView.vue | `PRODUCT_MAP` |
| `/solutions` | SolutionListView.vue | `INDUSTRY_TABS` |
| `/solutions/:slug` | SolutionDetailView.vue | `INDUSTRY_MAP` |
| `/cases` | CaseListView.vue | API → fallback `CASES` |
| `/cases/:slug` | CaseDetailView.vue | API → fallback `CASES` |
| `/resources` | ResourceListView.vue | `RESOURCES` |
| `/resources/:slug` | ResourceDetailView.vue | `RESOURCES` |
| `/news` | NewsListView.vue | API |
| `/news/:slug` | NewsDetailView.vue | API |
| `/careers` | CareersView.vue | API |
| `/careers/campus` | CampusCareersView.vue | API |
| `/careers/social` | SocialCareersView.vue | API |
| `/careers/:id` | JobDetailView.vue | API |
| `/about` | AboutView.vue | 静态 + i18n |
| `/about/team` | TeamView.vue | API |
| `/about/contact` | ContactView.vue | 静态 |
| `/about/partners` | PartnersView.vue | API |
| `/blog` / `/blog/:slug` | BlogListView / BlogDetailView | API |
| `/forum` / `/forum/topic/:id` | ForumView / ForumTopicView | API |
| `/profile` | ProfilePage.vue | API |

---

## 四、数据文件速查

| 文件 | 内容 | 导出 |
|------|------|------|
| `src/data/products.js` | 20 产品，4 个 Tab | `PRODUCT_TABS`, `PRODUCT_MAP` |
| `src/data/industries.js` | 5 行业方案 | `INDUSTRY_TABS`, `INDUSTRY_MAP` |
| `src/data/cases.js` | 8 客户案例 | `CASES`, `CASE_INDUSTRIES` |
| `src/data/resources.js` | 16 资源，8 种类型 | `RESOURCES`, `RESOURCE_TYPES`, `RESOURCE_TYPE_STYLES` |
| `src/data/navigation.js` | 导航 + 页脚链接 | `NAV_LINKS`, `FOOTER_LINKS`, `HOT_TAGS` |

---

## 五、环境状态

### 5.1 后端服务
```
API 基地址    → http://localhost:4000/api/v1
Swagger 文档  → http://localhost:4000/api/docs
```

### 5.2 常用命令
```bash
# 前端
cd talentpro-v2
npm run dev        # localhost:3000
npm run build      # dist/
npm run test       # Vitest 117 tests
npx playwright test # E2E（需确保 preview 在 :3000 运行）

# 后端
cd talentpro-backend
npm run docker:up
npm run start:dev  # :4000
```

---

## 六、关键设计决策（本次会话）

### 6.1 API Fallback 策略
案例、新闻等页面优先调用后端 API，失败时自动回退到 `src/data/` 静态数据，确保页面始终可访问。

### 6.2 数据驱动页面
所有二级页面内容从 `src/data/*.js` 驱动，修改数据无需触碰 Vue 组件，极大提升维护性。

### 6.3 快速索引表
`PRODUCT_MAP` / `INDUSTRY_MAP` 实现 O(1) slug 查找，替代数组遍历。

### 6.4 参考设计来源
- **产品页**: Apple 产品页（Hero + 功能网格 + 规格）、Workday/Salesforce 产品详情
- **解决方案**: 德勤/安永咨询方案页（痛点 → 架构 → 路径 → 案例 → ROI）
- **客户案例**: Salesforce Customer 360、Workday Stories（Featured + 指标 + 叙事结构）
- **资源中心**: AWS/GCP 文档中心（分类筛选 + 手册/白皮书/视频）
- **招聘页**: Google Careers、字节跳动招聘（双通道入口 + 福利展示）

---

## 七、下一步工作（待办）

### 优先级 P0
- [ ] **E2E 测试补充**: Playwright 覆盖二级页面核心流程（产品详情跳转、案例筛选、资源下载）
- [ ] **图片资源**: 为案例/新闻/产品添加真实封面图（当前使用占位符或 CSS 背景）

### 优先级 P1
- [ ] **后端数据填充**: 在 NestJS 中录入真实的案例/新闻/职位/团队/合作伙伴数据，替换前端 fallback
- [ ] **搜索索引扩展**: `src/data/searchIndex.js` 加入二级页面内容，支持全局搜索直达
- [ ] **SEO 增强**: 二级页面动态生成 `<meta>`、Open Graph、结构化数据（JSON-LD）

### 优先级 P2
- [ ] **页面动画**: 为二级页面添加 `reveal` 滚动入场动画（复用 App.vue 全局 IO）
- [ ] **性能优化**: 产品/行业数据文件较大（~30KB/20KB gzip），评估是否需要按需加载
- [ ] **管理后台**: `talentpro-admin/` 需要与新增的后端模块对接（案例/新闻/职位管理）

---

## 八、关键文件速查

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 项目规范与编码约定（必看） |
| `MEMORY.md` | 本文件，当前状态存档 |
| `src/router/index.js` | 全部 24 条路由定义 |
| `src/data/products.js` | 产品矩阵完整数据 |
| `src/data/industries.js` | 行业方案完整数据 |
| `src/data/cases.js` | 客户案例静态数据 |
| `src/data/resources.js` | 资源中心完整数据 |
| `src/i18n/locales/zh-CN.json` | 主语言包（~450 keys） |

---

*本文件由 Kimi Code CLI 在会话结束时自动生成。下次重启时请优先阅读本文件和 AGENTS.md。*
