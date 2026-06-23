# TalentPro HR Portal — 产品规划文档

> **产出角色**：产品经理 Agent
> **文档版本**：v4.2.0（覆盖 v2.3.0 ~ v4.2.0 完整规划）
> **最后更新**：2026-06-19
> **当前基线**：v4.2.0 ✅（P0/P1/P2 清理完成，CI 全绿）

---

## 一、产品背景与迭代方向

### 当前状态评估

v2.2.0 GA 已完成全部预定目标，形成坚实的技术与视觉基线：

| 维度 | 现状 |
|------|------|
| 页面完整度 | 15 个 Section 全量实装 + 博客/论坛/案例/资源/新闻/Marketplace |
| 响应式 | 375px / 768px / 1280px 三断点全覆盖 |
| 组件体系 | 60+ Vue 组件，22 个 Composables，12+ 数据文件 |
| 国际化 | ✅ 简体中文 / English / 繁體中文（@nuxtjs/i18n） |
| 无障碍 | ✅ focus-visible、aria、skip-link、减弱动效 |
| 主题系统 | ✅ 亮色 / 暗色模式（data-theme） |
| 全局搜索 | ✅ Cmd+K 本地搜索 |
| 性能优化 | ✅ 图片懒加载、异步弹窗 chunk、字体子集、PWA |
| SEO | ✅ SSG 预渲染、动态 meta、JSON-LD、hreflang |
| 用户行为分析 | ✅ 埋点队列、滚动深度、A/B 测试框架 |

### 用户调研洞察（假设性 PRD 输入）

基于 SaaS 营销门户行业最佳实践与竞品分析（Workday / SAP SuccessFactors / 北森），提炼以下核心用户需求：

| 用户群体 | 核心痛点 | 期望功能 |
|---------|---------|---------|
| 海外企业 HR | 无法阅读中文页面 | 英语/繁体中文版本 |
| 访客（首次接触）| 找不到想要的产品信息 | 全局快速搜索 |
| 夜间工作 HR | 强光页面眼疲劳 | 暗色主题 |
| 移动端用户 | 表单输入体验差 | 移动端优化弹窗 |
| 企业 IT 采购 | 无法量化 ROI | ROI 计算器 |
| SEO/SEM 团队 | 页面在搜索引擎不可见 | SSR + meta 优化 |

---

## 二、版本路线图（v2.3 ~ v2.5）

```
v2.2.0  GA      ████████████████  ✅ 2026-03-15  基线版本
                                                   11 个问题全部清零
v2.3.0          ████████████████  ✅ 2026-04-20  体验增强
                Sprint 11-12       多语言（EN/繁中）+ 暗色模式 + 全局搜索
                                   
v2.4.0          ████████████████  ✅ 2026-05-15  转化提升
                Sprint 13-14       ROI 计算器 + 智能推荐 + 表单增强
                                   + Cookies 偏好 + A/B 测试框架
                                   
v2.5.0          ████████████████  ✅ 2026-05-26  性能与分发
                Sprint 15-16       动态 SEO + 埋点分析 + 代码分割
                                   + PWA 支持 + 字体子集化（部分）

v2.6.0          ████████████████  ✅ 2026-05-26  内容生态迭代
                Sprint 17-18       Vue 3 迁移 + 后端 API + 博客/论坛
                                   + Admin 后台 + 用户认证

v3.0.0          ████████████████  ✅ 2026-05-27  安全与架构升级
                Sprint 19-20       CMS 动态化 + Workspace 隔离 + JWT 黑名单
                                   + PII 加密 + Redis 缓存 + SSE 流式输出
                                   + 审计日志 + CI/CD 流水线 + 依赖安全修复

v4.0.0          ████████████████  ✅ 2026-06-01  Nuxt 3 迁移与工程化
                Sprint 21          文件路由 + 自动导入 + SSR-safe Pinia
                                   + @nuxtjs/i18n + @nuxt/image + PWA 重构

v4.1.0          ████████████████  ✅ 2026-06-09  交易与扩展模块
                Sprint 22          Marketplace + Payment（Stripe）+ Cart

v4.2.0          ████████████████  ✅ 2026-06-19  配置治理与安全加固
                Sprint 23          JWT Cookie-only 前端 + 后端双渠道认证
                                   + CSP 前后端配置 + 限流收紧 + 安全测试
                                   + BullMQ 重试/死信 + 覆盖率阈值 + 硬编码色值治理
```

---

## 三、v2.3.0 — 体验增强批次

> **核心目标**：让产品对国际用户可用，对夜间用户友好，对所有用户信息可达
> **包含 Sprint**：Sprint 11（多语言 + 暗色模式）/ Sprint 12（全局搜索）

---

### Sprint 11 — 多语言支持 + 暗色模式

**周期目标**：搭建 i18n 架构 + 实现 EN / 繁体中文切换；实现跟随系统 / 手动暗色模式

#### 功能模块 A：多语言（i18n）

**用户故事**
> "作为一名来自跨国企业的 HR，我希望能用英文阅读 TalentPro 的产品介绍，以便向外籍管理层汇报。"

**技术方案选型**

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| 原生 JSON 字典 + Context | 零依赖，轻量 | 需自建插值/复数 | ✅ **选用** |
| react-i18next | 成熟生态，插值完备 | 增加 ~30KB bundle | 备选（可升级） |
| next-intl | 优秀 SSR 支持 | 依赖 Next.js | 不适用 |

**架构设计**

```
src/
├── i18n/
│   ├── index.js              ← useI18n Hook + I18nContext
│   ├── locales/
│   │   ├── zh-CN.json        ← 简体中文（默认，已有内容提取）
│   │   ├── en.json           ← 英语
│   │   └── zh-TW.json        ← 繁体中文
│   └── interpolate.js        ← 简单 {var} 插值函数
```

**i18n 工作原理**
```js
// src/i18n/index.js
const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(
    localStorage.getItem('tp-locale') ?? navigator.language.split('-')[0] ?? 'zh'
  );
  const dict = DICTS[locale] ?? DICTS['zh'];

  const t = (key, vars = {}) => {
    const raw = key.split('.').reduce((o, k) => o?.[k], dict) ?? key;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), raw);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
export const useI18n = () => useContext(I18nContext);
```

**语言键命名规范**
```json
// zh-CN.json（片段示例）
{
  "nav": {
    "aifamily": "AI Family",
    "products": "产品",
    "solutions": "解决方案",
    "cases": "客户案例",
    "resources": "资源中心",
    "login": "登录",
    "demo": "预约演示",
    "phone": "售前: 400-888-8888"
  },
  "hero": {
    "badge": "🚀 IDC 连续五年 HR SaaS 市场占有率第一",
    "title1": "用",
    "titleAI": " AI ",
    "title2": "重新定义",
    "titleBreak": "人才管理",
    "subtitle": "TalentPro 为中大型企业提供一体化 HR SaaS...",
    "cta1": "预约演示 →",
    "cta2": "▶ 观看产品演示",
    "trust1": "8000+ 企业客户",
    "trust2": "2000万+ 活跃用户",
    "trust3": "99.9% SLA 保障",
    "trust4": "20年技术积累"
  },
  "modal": {
    "step1Title": "预约产品演示",
    "step1Sub": "专属顾问将在 1 个工作日内联系您",
    "labelName": "姓名",
    "labelCompany": "公司名称",
    "labelPhone": "手机号码",
    "labelCode": "验证码",
    "sendCode": "获取验证码",
    "resend": "{n}s 后重新获取",
    "next": "下一步 →",
    "submit": "提交预约 →",
    "successTitle": "预约成功！",
    "successSub": "我们的专属顾问将在 1 个工作日内与您联系"
  }
}
```

**语言切换 UI**（NavBar 右侧追加）
```
[🌐 中文 ▾]  → 下拉：简体中文 / English / 繁體中文
```
- 选中后写入 `localStorage['tp-locale']`
- `<html lang="zh-CN">` 同步更新（影响屏幕阅读器 + SEO）
- 切换动画：淡入淡出 200ms（避免闪烁）

**需翻译的文本范围（英文版）**

| 模块 | 字符数（估算）| 优先级 |
|------|------------|-------|
| NavBar + Footer | ~200 字 | P0 |
| Hero Section | ~300 字 | P0 |
| Stats / Brand | ~50 字 | P0 |
| 产品矩阵（16 个产品名 + 描述）| ~800 字 | P0 |
| AI Family | ~300 字 | P0 |
| 行业方案（5 个行业 × 3 个特色）| ~1000 字 | P1 |
| 证言轮播（4 条）| ~600 字 | P1 |
| Logo 墙、WhyUs、CTA | ~400 字 | P1 |
| 资源中心（6 条）| ~400 字 | P1 |
| 弹窗（3 步 + 成功态）| ~300 字 | P0 |
| **合计** | **~4350 字** | — |

---

#### 功能模块 B：暗色模式

**用户故事**
> "作为一名需要在夜间处理招聘数据的 HR，我希望页面有暗色选项，减少眼睛疲劳。"

**技术方案**

```
方案：CSS 变量覆盖 + data-theme attribute
实现：
  1. global.css 增加 [data-theme="dark"] 选择器，覆盖所有 :root 变量
  2. useTheme Hook：读/写 localStorage['tp-theme']，监听 prefers-color-scheme
  3. App.jsx：将 data-theme 挂载到 <html> 元素
  4. NavBar 追加主题切换按钮（☀️ / 🌙 图标）
```

**暗色 Token 映射**

| 变量 | 亮色值 | 暗色值 |
|------|-------|-------|
| `--primary` | `#1B5FEB` | `#4B82F5`（提亮） |
| `--gray-900` | `#0F172A` | `#F1F5F9` |
| `--gray-700` | `#334155` | `#CBD5E1` |
| `--gray-50` | `#F8FAFB` | `#0F172A` |
| `--gray-100` | `#F0F4F8` | `#1E293B` |
| `--gray-200` | `#E2E8F0` | `#334155` |
| page bg | `white` | `#0A1628` |
| card bg | `white` | `#1E293B` |
| card border | `#E2E8F0` | `#334155` |

**特殊处理**
- Hero / AI Family / WhyUs / CTA 等深色 Section：暗色下背景色微调（更深），文字不变
- 产品卡片边框：暗色下 `--gray-200` → `#334155`
- 弹窗背景：暗色下 `white` → `#1E293B`

**useTheme Hook**
```js
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('tp-theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tp-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}
```

#### Sprint 11 Token 预算

| 任务 | 涉及文件 | 输入估算 | 输出估算 |
|------|---------|---------|---------|
| T11-01 `src/i18n/` 架构搭建（Hook + Context）| 新建 | ≈ 3,000 | ≈ 3,000 |
| T11-02 `zh-CN.json` 全量文本提取（~4350字）| 所有数据文件 + 组件 | ≈ 10,000 | ≈ 8,000 |
| T11-03 `en.json` 英文翻译 | zh-CN.json | ≈ 5,000 | ≈ 6,000 |
| T11-04 `zh-TW.json` 繁体转换 | zh-CN.json | ≈ 4,000 | ≈ 4,500 |
| T11-05 所有组件接入 `useI18n` / `t()` | 37 个组件（批量） | ≈ 18,000 | ≈ 12,000 |
| T11-06 NavBar 语言切换器 UI | NavBar.jsx + .module.css | ≈ 5,000 | ≈ 2,000 |
| T11-07 `useTheme` Hook + `ThemeContext` | 新建 | ≈ 2,000 | ≈ 1,500 |
| T11-08 `global.css` 暗色 Token 覆盖层 | global.css | ≈ 3,000 | ≈ 3,000 |
| T11-09 NavBar 主题切换按钮 | NavBar.jsx | ≈ 3,000 | ≈ 1,000 |
| T11-10 各组件暗色样式回归修复 | 逐个 .module.css | ≈ 8,000 | ≈ 5,000 |
| **合计** | | **≈ 61,000** | **≈ 46,000** |

> ⚠️ 本 Sprint 是整个路线图中最重的一个（T11-05 组件批量接入），建议拆分为 2 个子 Sprint：
> - Sprint 11a：i18n 架构 + 文本提取 + 暗色 Token（T11-01~04, T11-07~08）
> - Sprint 11b：组件批量接入 + 语言切换器 + 暗色按钮 + 回归（T11-05~06, T11-09~10）

#### Sprint 11 验收标准

**多语言**
- [ ] NavBar 右侧显示语言切换下拉（中/EN/繁）
- [ ] 切换后**全页面**文本同步更新，无需刷新
- [ ] `<html lang>` 属性随语言切换同步更新
- [ ] 语言偏好持久化（刷新后保持所选语言）
- [ ] 英文版所有硬编码中文文本消失（无遗漏）
- [ ] 弹窗表单标签、错误提示均已国际化
- [ ] 繁体中文转换正确（无简体遗漏）

**暗色模式**
- [ ] NavBar 主题切换按钮显示当前状态（☀️亮/🌙暗）
- [ ] 切换后全页面背景/文字/卡片颜色正确适配
- [ ] 首次访问自动跟随系统偏好（prefers-color-scheme）
- [ ] 主题偏好持久化（刷新后保持）
- [ ] Hero / AI Family 等深色区在暗色模式下不失去层次感
- [ ] 弹窗在暗色模式下背景/输入框正确显示

---

### Sprint 12 — 全局搜索

**周期目标**：让访客通过关键词快速定位产品、行业、资源信息

#### 用户故事

> "作为一名对 TalentPro 感兴趣的 CHRO，我想直接搜索'制造业考勤'，而不是手动翻遍所有行业方案Tab。"

> "作为一名 HR 经理，我想搜索'AI 面试'，快速找到相关产品介绍和案例文章。"

#### 功能规格

**触发方式**
- NavBar 右侧搜索图标（🔍），点击展开
- 快捷键：`Cmd/Ctrl + K`（标准 Command Palette 体验）
- 移动端：NavBar 搜索按钮

**搜索覆盖范围**

| 类别 | 示例内容 | 权重 |
|------|---------|------|
| 产品 | 招聘管理系统、AI 面试官、绩效管理 | 1.0（最高）|
| 行业方案 | 制造业、零售连锁、互联网、央国企 | 0.9 |
| 资源 | 白皮书标题、案例集、干货文章 | 0.8 |
| 功能特色 | 智能排班、AI 初筛、360度评估 | 0.7 |
| 通用 | 关于我们、价格、安全、API | 0.5 |

**搜索索引结构**（纯前端，无后端）

```js
// src/data/searchIndex.js
export const SEARCH_INDEX = [
  // 产品类
  { id: 'recruit', type: 'product', title: '招聘管理系统',
    tags: ['招聘', '校招', '社招', 'JD', 'HR'], section: 'products',
    desc: '全流程数字化招聘，提升人才获取效率', icon: 'IconRecruit' },
  { id: 'ai-interview', type: 'product', title: 'AI 面试官',
    tags: ['AI', '面试', '候选人', '智能', '7x24'], section: 'ai',
    desc: '不止评能力，更要测潜力', icon: 'IconAIInterview' },
  // 行业类
  { id: 'mfg', type: 'industry', title: '制造业方案',
    tags: ['制造', '排班', '考勤', '蓝领', '工厂', '资质'], section: 'industry',
    desc: '智能排班 + 试工管理 + 资质追踪' },
  // 资源类
  { id: 'whitepaper', type: 'resource', title: '2026 HR 数智化白皮书',
    tags: ['白皮书', '报告', 'HRDIMM', '趋势'], section: 'resources',
    desc: '整合 567 家企业调研洞察' },
  // ... 共 ~50 条索引记录
];
```

**搜索算法**（前端全文检索）
```js
// useSearch Hook
function scoreItem(item, query) {
  const q = query.toLowerCase();
  let score = 0;
  // 标题完全匹配：+100
  if (item.title.toLowerCase().includes(q)) score += 100;
  // 标签匹配：每个 +30
  score += item.tags.filter(t => t.includes(q)).length * 30;
  // 描述匹配：+10
  if (item.desc?.toLowerCase().includes(q)) score += 10;
  // 类型权重修正
  score *= { product: 1.0, industry: 0.9, resource: 0.8, general: 0.5 }[item.type] ?? 1;
  return score;
}
```

**搜索框 UI 规格**

```
触发 Cmd+K 或点击图标后：
┌─────────────────────────────────────────────────┐
│  🔍  搜索产品、行业方案、资源...           ⌘K  │  ← 搜索输入框（全宽，max-w: 640px，居中浮层）
├─────────────────────────────────────────────────┤
│  🔥 热门搜索                                     │  ← 无输入时显示
│  AI 招聘  制造业方案  白皮书  360评估  校招      │
├─────────────────────────────────────────────────┤
│  [当用户输入时显示搜索结果]                      │
│  ─────── 产品 (3) ─────────────────────────────  │
│  [图标] AI 面试官    不止评能力，更要测潜力  →  │
│  [图标] AI 招聘助手  智能简历筛选、JD生成    →  │
│  ─────── 行业方案 (1) ─────────────────────────  │
│  [图]   制造业方案   智能排班+试工管理       →  │
│  ─────── 资源 (1) ──────────────────────────────  │
│  [图]   AI 面试官案例集                      →  │
└─────────────────────────────────────────────────┘
底部：ESC 关闭  ↑↓ 键盘导航  Enter 跳转
```

**交互细节**
- 输入防抖：150ms（避免每次按键都重新过滤）
- 无结果态：显示「未找到 "{query}"」+ 推荐热门搜索
- 键盘支持：↑↓ 移动焦点，Enter 跳转 / 触发操作，Esc 关闭
- 搜索命中关键词高亮（`<mark>` 标签）
- 点击结果后：滚动到对应 Section + 关闭搜索框

**新增文件**

```
src/
├── hooks/useSearch.js           ← 搜索状态 + 算法 + 键盘导航
├── context/SearchContext.js     ← 全局搜索开关（Cmd+K 触发）
├── data/searchIndex.js          ← ~50 条搜索索引数据
└── components/ui/SearchModal/
    ├── SearchModal.jsx          ← 搜索浮层组件
    └── SearchModal.module.css
```

#### Sprint 12 Token 预算

| 任务 | 涉及文件 | 输入估算 | 输出估算 |
|------|---------|---------|---------|
| T12-01 `src/data/searchIndex.js`（~50条）| 各 data 文件参考 | ≈ 6,000 | ≈ 4,000 |
| T12-02 `useSearch.js` Hook（算法+键盘导航）| 参考 useModal | ≈ 3,000 | ≈ 2,500 |
| T12-03 `SearchContext.js` | 参考 ModalContext | ≈ 1,500 | ≈ 800 |
| T12-04 `SearchModal.jsx` + `.module.css` | — | ≈ 4,000 | ≈ 5,000 |
| T12-05 NavBar 接入搜索按钮 + `Cmd+K` 监听 | NavBar.jsx | ≈ 4,000 | ≈ 1,500 |
| T12-06 App.jsx 接入 SearchContext | App.jsx | ≈ 2,000 | ≈ 500 |
| **合计** | | **≈ 20,500** | **≈ 14,300** |

#### Sprint 12 验收标准

- [ ] NavBar 右侧显示搜索图标，点击弹出搜索框
- [ ] `Cmd+K`（Mac）/ `Ctrl+K`（Win）触发搜索
- [ ] 无输入时显示热门搜索标签
- [ ] 输入「AI」返回 AI 相关产品 + 案例，分类清晰
- [ ] 输入「制造」返回制造业方案
- [ ] 键盘 ↑↓ 导航，Enter 跳转，Esc 关闭
- [ ] 关键词高亮显示
- [ ] 点击结果滚动到对应 Section
- [ ] Mobile：搜索图标在汉堡菜单旁，点击全屏展开
- [ ] 无结果时显示提示 + 推荐

---

## 四、v2.4.0 — 转化提升批次

> **核心目标**：提升页面转化率，用数据驱动决策，强化弹窗体验
> **包含 Sprint**：Sprint 13（ROI 计算器 + 智能推荐）/ Sprint 14（表单增强 + Cookie + A/B 框架）

---

### Sprint 13 — ROI 计算器 + 智能推荐模块

#### 功能 A：ROI 计算器（新增 Section SEC-16）

**用户故事**
> "作为一名需要向 CFO 汇报采购决策的 CHRO，我希望有一个工具能帮我估算引入 TalentPro 后的 ROI，以便获得预算批准。"

**计算模型**

```
输入参数（用户可调节滑块）：
  - 员工总数：100 ~ 50,000（步长 100）
  - 月均招聘人数：5 ~ 500
  - 招聘平均周期（天）：7 ~ 90
  - HR 团队人数：1 ~ 50
  - 人均 HR 月薪（元）：5,000 ~ 30,000

输出指标（动态计算）：
  - 年节省 HR 工时成本：= HR人数 × 月薪 × 效率提升比例(40%) × 12
  - 年减少招聘周期成本：= 月招聘量 × 12 × 每天招聘成本 × 减少天数比例(35%)
  - 年减少人员流失成本：= 员工总数 × 离职率(15%) × 人均流失成本(2月薪) × 留存改善(20%)
  - 预估年度ROI：= 总节省 / TalentPro年费(假设) × 100%
  - 投资回收期（月）

显示方式：
  - 3 个核心数字大字展示（animate count-up）
  - 1 个横向对比柱状图（引入前 vs 引入后）
  - 底部CTA：「基于您的规模获取定制方案 →」（触发 DemoModal）
```

**UI 规格**
```
布局：左侧参数区（滑块 × 5）| 右侧结果区（数字 + 图表）
背景：浅灰 --gray-50，与 Stats Section 形成区隔
位置：资源中心（SEC-11）下方，CTA Banner（SEC-12）上方
Section ID：SEC-16
```

**新增文件**
```
src/
├── components/sections/RoiCalculatorSection/
│   ├── RoiCalculatorSection.jsx
│   ├── RoiCalculatorSection.module.css
│   └── RoiChart.jsx              ← 简单 SVG 柱状图（无外部依赖）
├── hooks/useRoiCalculator.js      ← 计算逻辑（纯函数，易测试）
```

---

#### 功能 B：智能产品推荐（弹窗内 Step 扩展）

**用户故事**
> "作为一名首次访问的制造业 HR，我希望网站能根据我的行业和需求推荐最合适的产品组合。"

**方案**：在 DemoModal Step2（产品选择）下方，根据用户已选产品 + 当前行业（从 URL 参数或用户行为推断），动态展示「推荐搭配」Chips。

```
示例：
用户选择「招聘管理」→ 推荐「人才测评」「AI 面试官」
用户选择「假勤管理」→ 推荐「薪酬管理」「组织人事」

规则数据（searchIndex 扩展）：
RECOMMEND_RULES = {
  'recruit':     ['assess-recruit', 'ai-interview', 'performance'],
  'attendance':  ['payroll', 'org'],
  'performance': ['talent', 'analytics'],
  ...
}
```

---

### Sprint 14 — 表单增强 + Cookie 偏好 + A/B 测试框架

#### 功能 A：弹窗表单增强

**用户故事**
> "作为移动端用户，我觉得现在的弹窗表单在手机上输入很不方便，希望有更好的体验。"

**具体改进**
- 手机号自动格式化（`138 0000 0000`，输入时插入空格）
- 输入框聚焦时表单自动滚动到顶部（解决键盘遮挡问题）
- Step 进度条添加文字说明（"第1步 / 共3步"）
- 支持微信手机号一键填入（`navigator.credentials` API，Progressive Enhancement）
- 添加「服务条款」复选框（合规要求）
- 成功页显示预约信息摘要（姓名、公司、产品）

#### 功能 B：Cookie / 隐私偏好中心

**用户故事**
> "作为一名关注数据隐私的用户，我希望能控制哪些追踪 Cookie 被允许使用。"

**规格**
```
首次访问展示 Cookie 横幅（页面底部）：
  「我们使用 Cookie 改善您的体验 [了解更多] [拒绝] [接受全部]」

Cookie 偏好中心（点击「了解更多」展开）：
  ✅ 必要 Cookie（不可关闭）   — 会话、登录状态
  ○  分析 Cookie（可选）       — 页面访问统计
  ○  营销 Cookie（可选）       — 再营销广告

存储：localStorage['tp-cookie-consent'] = { analytics: bool, marketing: bool, ts: Date }
```

**新增文件**
```
src/
├── components/ui/CookieBanner/
│   ├── CookieBanner.jsx
│   └── CookieBanner.module.css
├── context/CookieContext.js
└── hooks/useCookieConsent.js
```

#### 功能 C：A/B 测试框架（轻量级）

**目标**：为 Hero CTA 按钮文案、弹窗步骤顺序等关键转化节点提供 A/B 测试基础设施

```js
// src/hooks/useABTest.js
export function useABTest(testId, variants = ['A', 'B']) {
  const key = `tp-ab-${testId}`;
  const [variant] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored && variants.includes(stored)) return stored;
    const v = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(key, v);
    return v;
  });
  return variant; // 返回 'A' 或 'B'
}

// 使用示例（CtaBannerSection.jsx）：
// const variant = useABTest('cta-text');
// const ctaText = variant === 'A' ? '预约产品演示 →' : '免费体验 14 天 →';
```

---

## 五、v2.5.0 — 性能与分发批次

> **核心目标**：让搜索引擎能抓取页面内容，让用户加载更快，让运营有数据看
> **包含 Sprint**：Sprint 15（SEO/SSR + 埋点）/ Sprint 16（性能优化 + PWA）

---

### Sprint 15 — SEO 优化 + 数据埋点

#### 功能 A：SEO 基础优化（无需 SSR）

> 即使不引入 Next.js，Vite SPA 也可通过以下手段提升 SEO：

**实施内容**
```
1. react-helmet-async（动态 <title> / <meta>）
   - 首页：<title>TalentPro — 用 AI 重新定义人才管理 | HR SaaS 领导者</title>
   - <meta name="description" content="...">
   - <meta property="og:title" / og:image / og:description>
   - 结构化数据（JSON-LD）：Organization + Product + FAQ Schema

2. Vite SSG 预渲染（vite-plugin-ssg）
   - 生成静态 HTML，内嵌初始内容
   - 搜索引擎无需等待 JS 执行即可抓取文本
   - 不需要 Node.js 服务器，仍可部署到 CDN

3. 语义化 HTML 补全
   - Section 增加 aria-labelledby
   - 产品卡片使用 <article>
   - 行业方案使用 <section role="tabpanel">
   - 图片 alt 属性全量补全

4. robots.txt + sitemap.xml 生成
```

#### 功能 B：数据埋点（行为分析）

**埋点设计原则**：最小化（不收集个人信息），服务业务决策

**核心埋点事件**

| 事件名 | 触发时机 | 分析目的 |
|-------|---------|---------|
| `page_view` | 页面加载 | 流量来源分析 |
| `section_visible` | Section 进入视口 | 内容消费深度 |
| `demo_modal_open` | 弹窗打开 | 转化漏斗入口 |
| `demo_step_complete` | 每步完成 | 漏斗流失节点 |
| `demo_submit` | 表单提交成功 | 最终转化 |
| `product_tab_click` | 切换产品 Tab | 产品兴趣分布 |
| `industry_tab_click` | 切换行业 Tab | 行业兴趣分布 |
| `search_query` | 执行搜索 | 用户意图分析 |
| `search_click` | 点击搜索结果 | 搜索满足率 |
| `video_play` | 视频弹窗打开 | 内容参与度 |
| `resource_download` | 点击资源获取 | 资源价值评估 |
| `roi_interact` | 调节 ROI 计算器 | 高意向用户识别 |
| `lang_switch` | 切换语言 | 国际用户规模 |
| `theme_switch` | 切换主题 | 暗色偏好比例 |

**技术实现**
```js
// src/hooks/useAnalytics.js
export function useAnalytics() {
  const track = useCallback((event, props = {}) => {
    // 检查 Cookie 同意
    const consent = JSON.parse(localStorage.getItem('tp-cookie-consent') ?? '{}');
    if (!consent.analytics) return;

    // 发送到分析平台（placeholder，可换 GA4 / 神策 / 友盟）
    window.tp_analytics?.push({ event, ...props, ts: Date.now() });

    // 开发模式打印
    if (import.meta.env.DEV) console.log('[Analytics]', event, props);
  }, []);

  return { track };
}
```

---

### Sprint 16 — 性能优化 + PWA

#### 性能优化目标（Lighthouse ≥ 95）

**代码分割（Dynamic Import）**

```js
// 懒加载非首屏组件（减少初始 bundle 体积）
const TestimonialSection     = lazy(() => import('./sections/TestimonialSection/TestimonialSection'));
const LogoWallSection        = lazy(() => import('./sections/LogoWallSection/LogoWallSection'));
const WhyUsSection           = lazy(() => import('./sections/WhyUsSection/WhyUsSection'));
const ResourceSection        = lazy(() => import('./sections/ResourceSection/ResourceSection'));
const RoiCalculatorSection   = lazy(() => import('./sections/RoiCalculatorSection/RoiCalculatorSection'));
const DemoModal              = lazy(() => import('./ui/DemoModal/DemoModal'));
const VideoModal             = lazy(() => import('./ui/VideoModal/VideoModal'));
const SearchModal            = lazy(() => import('./ui/SearchModal/SearchModal'));
```

**图片与字体优化**
- Noto Sans SC 字体子集化（仅加载常用汉字 6763 个，从 ~3MB → ~300KB）
- 添加 `font-display: swap`
- 产品 SVG 图标提取为独立 `.svg` 文件，通过 HTTP/2 并行加载
- `<link rel="preconnect">` 预连接 Google Fonts

**其他**
- Vite bundle 分析（`rollup-plugin-visualizer`）
- 移除 `console.log`（生产环境）
- 开启 Vite `minify: 'terser'` + gzip

#### PWA 支持

**用户故事**
> "作为一名经常在移动端浏览的 HR，我希望 TalentPro 网站能像 App 一样流畅，甚至可以添加到主屏幕。"

**实施内容**
```
1. vite-plugin-pwa（Workbox 封装）
2. Web App Manifest（manifest.json）
   - 短名称：TalentPro
   - 主题色：#1B5FEB
   - 图标：192×192 / 512×512
3. Service Worker 缓存策略
   - App Shell（HTML + CSS + JS）：CacheFirst
   - Google Fonts：StaleWhileRevalidate
   - 动态内容（API 调用）：NetworkFirst（预留）
4. 离线页面（offline.html）
5. 「添加到主屏幕」提示（BeforeInstallPrompt 事件）
```

---

## 六、新问题追踪看板

| ID | 类型 | 优先级 | 描述 | 版本 | Sprint | 状态 |
|----|------|-------|------|------|--------|------|
| **v2.3.0** | | | | | | |
| I18N-01 | 🆕 新增 | 🔴 P0 | i18n 架构搭建（Context + Hook + JSON）| v2.3.0 | S11a | ✅ |
| I18N-02 | 🆕 新增 | 🔴 P0 | 全量中文文本提取到 zh-CN.json | v2.3.0 | S11a | ✅ |
| I18N-03 | 🆕 新增 | 🔴 P0 | 英文翻译 en.json | v2.3.0 | S11a | ✅ |
| I18N-04 | 🆕 新增 | 🟡 P1 | 繁体中文 zh-TW.json | v2.3.0 | S11a | ✅ |
| I18N-05 | 🆕 新增 | 🔴 P0 | 所有组件接入 useI18n | v2.3.0 | S11b | ✅ |
| I18N-06 | 🆕 新增 | 🔴 P0 | NavBar 语言切换器 | v2.3.0 | S11b | ✅ |
| DARK-01 | 🆕 新增 | 🟡 P1 | useTheme Hook + Token 暗色覆盖层 | v2.3.0 | S11a | ✅ |
| DARK-02 | 🆕 新增 | 🟡 P1 | 所有组件暗色样式回归修复 | v2.3.0 | S11b | ✅ |
| DARK-03 | 🆕 新增 | 🟡 P1 | NavBar 主题切换按钮 | v2.3.0 | S11b | ✅ |
| SRCH-01 | 🆕 新增 | 🟡 P1 | searchIndex.js（~50条）| v2.3.0 | S12 | ✅ |
| SRCH-02 | 🆕 新增 | 🟡 P1 | useSearch Hook + 算法 | v2.3.0 | S12 | ✅ |
| SRCH-03 | 🆕 新增 | 🟡 P1 | SearchModal 组件 | v2.3.0 | S12 | ✅ |
| SRCH-04 | 🆕 新增 | 🟡 P1 | Cmd+K 全局快捷键 + NavBar 接入 | v2.3.0 | S12 | ✅ |
| **v2.4.0** | | | | | | |
| ROI-01 | 🆕 新增 | 🟡 P1 | ROI 计算器 Section（SEC-16）| v2.4.0 | S13 | ✅ |
| ROI-02 | 🆕 新增 | 🟡 P1 | useRoiCalculator Hook + 5 维计算模型 | v2.4.0 | S13 | ✅ |
| REC-01 | 🆕 新增 | 🟢 P2 | DemoModal 智能产品推荐 | v2.4.0 | S13 | ✅ |
| FORM-01 | 🆕 新增 | 🟡 P1 | 弹窗表单增强（格式化/滚动/摘要）| v2.4.0 | S14 | ✅ |
| COOK-01 | 🆕 新增 | 🟡 P1 | Cookie 同意横幅 + 偏好中心 | v2.4.0 | S14 | ✅ |
| AB-01   | 🆕 新增 | 🟢 P2 | A/B 测试框架（useABTest Hook + 后端实验管理）| v2.4.0 | S14 | ✅ |
| **v2.5.0** | | | | | | |
| SEO-01 | 🆕 新增 | 🟡 P1 | 动态 title / meta（Blog/Forum 详情页手动更新）| v2.5.0 | S15 | ✅ |
| SEO-02 | 🆕 新增 | 🟡 P1 | 构建时语义化 HTML 预渲染（prerender.js）| v2.5.0 | S15 | ✅ |
| SEO-03 | 🆕 新增 | 🟢 P2 | JSON-LD 结构化数据 | v2.5.0 | S15 | ⏳ |
| ANA-01 | 🆕 新增 | 🟡 P1 | useAnalytics Hook + 14 个核心事件 + 热力图/滚动深度 | v2.5.0 | S15 | ✅ |
| PERF-01 | 🆕 新增 | 🟡 P1 | 非首屏组件 defineAsyncComponent 代码分割 | v2.5.0 | S16 | ✅ |
| PERF-02 | 🆕 新增 | 🟡 P1 | 字体子集化（Noto Sans SC）| v2.5.0 | S16 | ⏳ |
| PWA-01  | 🆕 新增 | 🟢 P2 | vite-plugin-pwa + Service Worker + Manifest | v2.5.0 | S16 | ✅ |
| **v3.0.0** | | | | | | |
| CMS-01 | 🆕 新增 | 🔴 P0 | CMS 动态化（首页板块配置）| v3.0.0 | S19 | ✅ |
| WS-01 | 🆕 新增 | 🔴 P0 | 多租户 Workspace 模型 | v3.0.0 | S19 | ✅ |
| AUTH-01 | 🆕 新增 | 🔴 P0 | 权限控制（RolesGuard + PermissionGuard）| v3.0.0 | S19 | ✅ |
| AUTH-02 | 🆕 新增 | 🔴 P0 | JWT 黑名单 + Token 轮转 | v3.0.0 | S19 | ✅ |
| ADMIN-01 | 🆕 新增 | 🟡 P1 | Admin CMS 管理页 | v3.0.0 | S19 | ✅ |
| ADMIN-02 | 🆕 新增 | 🟡 P1 | Admin 富文本编辑器 | v3.0.0 | S19 | ✅ |
| ADMIN-03 | 🆕 新增 | 🟡 P1 | Admin 图表库（Dashboard）| v3.0.0 | S19 | ✅ |
| SEC-01 | 🆕 新增 | 🔴 P0 | PII 字段级加密（AES-256-GCM）| v3.0.0 | S20 | ✅ |
| SEC-02 | 🆕 新增 | 🟡 P1 | IP 黑白名单 | v3.0.0 | S20 | ✅ |
| SEC-03 | 🆕 新增 | 🟡 P1 | 系统管理页面 | v3.0.0 | S20 | ✅ |
| SSE-01 | 🆕 新增 | 🟡 P1 | 通知系统 SSE + Redis Pub/Sub | v3.0.0 | S20 | ✅ |
| SENTRY-01 | 🆕 新增 | 🟢 P2 | Sentry 错误监控集成 | v3.0.0 | S20 | ✅ |
| DOC-01 | 🆕 新增 | 🟢 P2 | 项目文档同步更新 | v3.0.0 | S20 | ✅ |

---

## 七、里程碑（完整版）

| 里程碑 | 目标日期 | 内容 | 状态 |
|-------|---------|------|------|
| M1 文档基础 | 2026-03-15 | 架构 + 设计系统 + 项目计划 | ✅ |
| M2 v2.0.0 基线 | 2026-03-15 | React 重构，15 Section，3 P0 Bug 修复 | ✅ |
| M3 v2.1.0 视觉 | 2026-03-15 | SVG图标 + 资源中心 + 页脚 + Hero | ✅ |
| M4 v2.2.0 媒体 | 2026-03-15 | Logo图形化 + 安全认证 + 视频弹窗 | ✅ |
| M5 v2.3.0 体验 | 2026-03-15 | 多语言（EN/繁中）+ 暗色模式 + 全局搜索 | ✅ |
| M6 v2.4.0 转化 | 2026-05-15 | ROI计算器 + 智能推荐 + 表单增强 + Cookie | ✅ |
| M7 v2.5.0 分发 | 2026-06-10 | SEO/SSG + 埋点 + 性能优化 + PWA | ✅ |
| M8 v3.0.0 安全架构 | 2026-05-27 | CMS动态化 + Workspace隔离 + PII加密 + JWT黑名单 + CI/CD | ✅ |

---

## 八、Sprint 优先级决策说明

### 为什么 i18n 放在最前？

TalentPro 客群包含跨国企业，英文版是进入国际市场的门票。技术上，越早建立 i18n 架构，后续维护成本越低。如果等到 v2.4.0 再做，届时需要重构大量已固化的硬编码文本。

### 为什么暗色模式与多语言同 Sprint？

两者都依赖「全局状态注入 App.jsx 根节点」的架构模式，同期实施可共享 Provider 组合方式，避免重复搭架子。

### 为什么全局搜索在 Sprint 12（非 Sprint 11）？

搜索索引（searchIndex.js）的文本内容依赖 i18n 文本体系稳定后才能准确录入，Sprint 11 先建立多语言键结构，Sprint 12 再基于此建立搜索索引（索引条目直接引用 i18n key），天然支持多语言搜索。

### 为什么 ROI 计算器放在 v2.4.0 而非 v2.3.0？

ROI 计算器需要与销售团队对齐计算参数（行业基准数据、TalentPro 报价逻辑），这些输入需要业务侧确认，无法在技术层独立完成，放到 v2.4.0 给业务侧充足准备时间。

---

## 九、技术风险与缓解措施

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| i18n 接入遗漏文本（硬编码中文残留）| 中 | 高 | T11-02 文本提取阶段使用正则全量扫描 `.vue` 文件中的中文字符 |
| 暗色模式颜色对比度不达标（WCAG AA）| 高 | 中 | 使用 `contrast-ratio` 工具逐一验证 Token，至少 4.5:1 |
| 搜索在低配设备上卡顿 | 低 | 低 | 防抖 150ms；索引 ≤100 条时无需 Web Worker |
| Vite SSG 与 Vue provide/inject 不兼容 | 中 | 高 | 提前验证 POC；降级方案：只预渲染 Landing Shell，Content 客户端水合 |
| 字体子集化导致特殊字符缺失 | 中 | 低 | 保留 Unicode 7500 以上区间；特殊字符 fallback 到系统字体 |
| A/B 测试数据污染（用户清除 localStorage）| 中 | 低 | 低风险，营销门户不需要高精度 A/B |

---

*产品经理 Agent 产出 | v2.3.0 ~ v3.0.0 全量规划 | 2026-05-28*
---

## 七、v2.3.1 Hotfix — Bug 追踪看板（Sprint 13）

> 来源：v2.3.0 GA 用户验收测试 · 2026-03-16

| ID | 类型 | 优先级 | 描述 | 根因 | Sprint | 状态 |
|----|------|-------|------|------|--------|------|
| BUG-101 ✅ | 🐛 | 🔴 P0 | 导航下拉菜单移到 div 会消失 | NavDropdown 8px 间隙 | S13 | ✅ |
| BUG-102 ✅ | ✨ | 🟡 P1 | 搜索 ⌘K 体验差，改内联展开 | 搜索 UX 重设计 | S13 | ✅ |
| BUG-103 ✅ | 🐛 | 🟡 P1 | Hero 深蓝背景突兀 + 卡片倾斜 | CSS 视觉问题 | S13 | ✅ |
| BUG-104 ✅ | 🐛 | 🔴 P0 | 品牌 Logo 滚动动画缺失 | marquee keyframe 未本地声明 | S13 | ✅ |
| BUG-105 ✅ | 🐛 | 🔴 P0 | Stats 数字双重 suffix（8000++）| useCountUp 已追加 suffix，span 重复渲染 | S13 | ✅ |
| BUG-106 ✅ | 🐛 | 🔴 P0 | 产品矩阵 Tab 内容空白 | 裸 .reveal 无全局观察者 | S13 | ✅ |
| BUG-107 ✅ | 🐛 | 🔴 P0 | AI Family 区域空白 | 同上 + AiCard linkText 默认值错误 | S13 | ✅ |
| BUG-108 ✅ | 🐛 | 🟡 P1 | 客户口碑需轮播+hover 悬停 | reveal 影响 + 轮播验证 | S13 | ✅ |
| BUG-109 ✅ | 🐛 | 🔴 P0 | Logo 筛选错位；WhyUs Tab 内容空 | hidden 占位 + 裸 reveal | S13 | ✅ |
| BUG-110 ✅ | 🐛 | 🔴 P0 | 资源中心区域空白 | 裸 .reveal 无全局观察者 | S13 | ✅ |
| BUG-111 ✅ | 🐛 | 🟡 P1 | 在线咨询无功能 | FloatingBar 无 onClick | S13 | ✅ |

