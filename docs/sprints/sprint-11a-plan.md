# Sprint 11a 计划 — i18n 架构 + 暗色 Token

> **状态**：📋 待 PO 批准
> **目标**：搭建多语言架构骨架 + 暗色模式 CSS Token 层，不触碰业务组件
> **原则**：本 Sprint 只建基础设施，不改任何现有组件（零功能回归风险）
> **Token 预算**：输入 ≈ 24,000 / 输出 ≈ 19,500

---

## 任务清单

| ID | 任务 | 最小化变更 | 状态 |
|----|------|----------|------|
| T11a-01 | 新建 `src/i18n/interpolate.js`：`{var}` 插值函数（5行） | 仅新建 | Todo |
| T11a-02 | 新建 `src/i18n/index.js`：I18nContext + I18nProvider + useI18n | 仅新建 | Todo |
| T11a-03 | 全量扫描 `.jsx` 提取中文文本 → `src/i18n/locales/zh-CN.json` | 仅新建 | Todo |
| T11a-04 | 新建 `src/i18n/locales/en.json`：英文翻译 | 仅新建 | Todo |
| T11a-05 | 新建 `src/i18n/locales/zh-TW.json`：繁体转换 | 仅新建 | Todo |
| T11a-06 | 新建 `src/hooks/useTheme.js`：亮/暗切换 + localStorage + prefers-color-scheme | 仅新建 | Todo |
| T11a-07 | 新建 `src/context/ThemeContext.js` | 仅新建 | Todo |
| T11a-08 | 更新 `src/styles/global.css`：追加 `[data-theme="dark"]` 覆盖层（~50行）| 追加，不改已有规则 | Todo |

## 文件架构

```
src/
├── i18n/
│   ├── index.js           ← I18nContext + I18nProvider + useI18n Hook
│   ├── interpolate.js     ← t('key', { var: val }) 插值
│   └── locales/
│       ├── zh-CN.json     ← ~4350 字中文文本（所有 section）
│       ├── en.json        ← 英文
│       └── zh-TW.json     ← 繁体
├── hooks/
│   └── useTheme.js        ← 新增
└── context/
    └── ThemeContext.js    ← 新增
```

## 暗色 Token 关键覆盖

```css
/* global.css 追加：[data-theme="dark"] */
[data-theme="dark"] {
  --primary:      #4B82F5;   /* 提亮，暗背景下可见 */
  --primary-dark: #2D63E0;
  --primary-light:#1E3A6E;
  --primary-glow: rgba(75,130,245,0.2);
  --gray-900:     #F1F5F9;   /* 翻转：文字变亮 */
  --gray-700:     #CBD5E1;
  --gray-600:     #94A3B8;
  --gray-400:     #475569;
  --gray-200:     #334155;
  --gray-100:     #1E293B;
  --gray-50:      #0F172A;
  /* 页面背景 */
  --page-bg:      #0A1628;
  /* 卡片 */
  --card-bg:      #1E293B;
  --card-border:  #334155;
}
body[data-theme="dark"] { background: var(--page-bg); }
```

## 验收标准

- [ ] `src/i18n/` 目录结构完整，3 个 JSON 文件全量覆盖所有页面文本
- [ ] `useI18n()` Hook 可在任意组件中调用，返回 `{ t, locale, setLocale }`
- [ ] `t('hero.title1')` 返回「用」（简中）/ 「With」（英）
- [ ] `useTheme()` 返回 `{ theme, toggle }` 
- [ ] 在浏览器 DevTools 手动设 `document.documentElement.setAttribute('data-theme','dark')` 后，页面背景变暗（验证 CSS 正确）
- [ ] 任何现有功能无回归（本 Sprint 不改组件）
