# TalentPro HR Portal

> 面向中大型企业的一体化 HR SaaS 平台官方营销门户  
> **当前版本**：v2.3.1 Hotfix  
> **技术栈**：React 18 + Vite 5 + CSS Modules

---

## 快速部署

```bash
# 1. 解压源码
unzip talentpro-v2.3.1-hotfix.zip

# 2. 进入目录并安装依赖
cd talentpro-v2
npm install

# 3. 启动开发服务器
npm run dev
# → http://localhost:3000

# 4. 生产构建
npm run build
# → dist/ 目录，可直接上传 CDN / Nginx
```

**环境要求**：Node.js ≥ 18，npm ≥ 9

---

## 版本路线图

| 版本 | 状态 | 核心内容 |
|------|------|---------|
| v2.0.0 | ✅ 完成 | React 重构基线，15 Section 全量实装 |
| v2.1.0 | ✅ 完成 | 20个 SVG 图标，资源中心 6条，页脚增强 |
| v2.2.0 | ✅ 完成 | Logo 图形化，安全认证徽章，视频弹窗 |
| v2.3.0 | ✅ 完成 | 三语言 i18n，暗色模式，Cmd+K 全局搜索 |
| v2.3.1 | ✅ 完成 | 11 个验收缺陷修复，Chatbot 智能客服 |
| v2.4.0 | 📋 规划 | ROI 计算器，智能产品推荐，表单增强 |
| v2.5.0 | 📋 规划 | SSG 预渲染，埋点分析，PWA |

---

## 项目结构

```
talentpro-v2/
├── index.html              # 入口 HTML
├── package.json            # React 18 + Vite 5
├── vite.config.js          # 构建配置
└── src/
    ├── App.jsx             # 根组件，5层 Provider
    ├── main.jsx            # React 挂载入口
    ├── i18n/               # 多语言（zh/en/zh-TW，355 keys）
    │   ├── index.jsx       # I18nProvider + useI18n Hook
    │   ├── interpolate.js  # {var} 插值
    │   ├── keyMap.js       # ID → i18n key 映射
    │   └── locales/        # zh-CN / en / zh-TW JSON
    ├── tokens/             # Design Token 常量
    ├── styles/             # 全局 CSS + 动画 + reveal
    ├── context/            # 5个全局 Context
    │   ├── ModalContext.js      # 预约弹窗
    │   ├── VideoModalContext.js # 视频弹窗
    │   ├── ThemeContext.js      # 暗色模式
    │   └── SearchContext.jsx    # 全局搜索
    ├── hooks/              # 9个自定义 Hook
    │   ├── useModal / useVideoModal / useCarousel
    │   ├── useCountUp / useNavScroll / useScrollReveal / useTabs
    │   ├── useSearch.jsx   # 搜索算法 + 防抖 + 键盘导航
    │   └── useTheme.jsx    # 主题切换
    ├── data/               # 11个纯数据文件
    │   └── searchIndex.js  # 50条搜索索引
    ├── components/
    │   ├── layout/         # NavBar（多语言/暗色/搜索）/ Footer
    │   ├── ui/             # 通用组件
    │   │   ├── DemoModal/  # 预约演示 3步骤弹窗
    │   │   ├── VideoModal/ # 产品演示视频弹窗
    │   │   ├── SearchModal/ # 全局搜索弹窗（z:2500）
    │   │   ├── ContactModal/ # 联系方式卡片（电话/二维码）
    │   │   └── ChatBot/    # 智能客服（AI问答 + 人工接入）
    │   └── sections/       # 15个页面 Section
    └── pages/
        └── HomePage.jsx    # 全部 Section 组装
```

---

## 功能特性

### 核心页面（15个 Section）
- **Hero** — 浅色渐变背景 + Dashboard 数字动画
- **品牌滚动** — CSS Marquee 无限滚动
- **Stats** — 6项 count-up 数字动画
- **产品矩阵** — 4 Tab × 20 个产品卡片 + SVG 图标
- **AI Family** — 深色玻璃态 + HOT 徽章 + 跨列 Banner
- **行业方案** — 5 Tab（制造/零售/互联网/央国企/金融）+ 5种截图样式
- **客户证言** — 3列自动轮播 + hover 暂停
- **Logo 墙** — 18个客户 + 行业筛选
- **为什么选我们** — 3 Tab + 安全认证徽章
- **资源中心** — 6张资源卡（白皮书/案例/文章/报告/视频）
- **CTA 通栏** — 转化按钮
- **页脚** — 4列 + 热门标签 + 二维码 + 社交图标

### v2.3.0 新特性
- **三语言** — 简体中文 / English / 繁體中文（355 个 i18n key，无缝切换）
- **暗色模式** — 跟随系统 / 手动切换，localStorage 持久化
- **全局搜索** — Cmd+K 触发，50条索引，关键词高亮，键盘导航

### v2.3.1 新特性
- **智能客服 Chatbot** — 14条 FAQ 知识库，打字机效果，快捷回复，人工接入申请
- NavBar 初始白色毛玻璃（Hero 浅色化后始终可见）

---

## 弹窗 z-index 层级

| 弹窗 | z-index | 触发方式 |
|------|---------|---------|
| DemoModal（预约演示）| 2000 | NavBar「预约演示」/ 各 CTA 按钮 |
| SearchModal（搜索）| 2500 | Cmd+K / NavBar 搜索图标 |
| ContactModal（联系方式）| 2100 | 浮动栏 📞 按钮 |
| ChatBot（智能客服）| 1500 | 浮动栏 💬 按钮（右下角浮窗，不遮罩）|
| VideoModal（视频演示）| 3000 | Hero「观看产品演示」按钮 |

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求文档 | `docs/prd.md` | 完整 PRD，含用户故事 |
| 项目规格 | `docs/project-spec.md` | 技术规格与验收标准 |
| 技术架构 | `docs/architecture.md` | 组件树、数据流、Hook 设计 |
| 设计系统 | `docs/design-system.md` | Token、色板、组件规范 |
| 项目计划 | `docs/project-plan.md` | 路线图、Sprint 计划、Bug 看板 |
| 风险登记册 | `docs/risk-register.md` | 技术与业务风险 |
| 测试计划 | `docs/test-plan.md` | 测试策略与用例 |
| Sprint 计划 | `docs/sprints/` | 各 Sprint 详细执行计划 |
| 变更记录 | `CHANGELOG.md` | 所有版本变更历史 |

---

*TalentPro HR Portal · React 18 + Vite 5 · v2.3.1*
