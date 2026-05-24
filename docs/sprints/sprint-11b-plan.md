# Sprint 11b 计划 — 组件接入多语言 + 暗色模式

> **状态**：📋 待 Sprint 11a 完成后执行
> **目标**：将 11a 搭建的基础设施接入所有组件，完成语言切换器 + 主题按钮 UI
> **依赖**：Sprint 11a 完成（i18n/index.js、locales、useTheme 均可用）
> **Token 预算**：输入 ≈ 37,000 / 输出 ≈ 28,500

---

## 任务清单

| ID | 任务 | 变更范围 | 状态 |
|----|------|---------|------|
| T11b-01 | 更新 `App.jsx`：包裹 `I18nProvider` + `ThemeContext.Provider` | 追加 2 Provider | Todo |
| T11b-02 | 更新所有数据文件（navigation.js / products.js 等）：硬编码文本 → i18n key 引用 | 9 个数据文件 | Todo |
| T11b-03 | 批量更新 Section 组件：所有中文硬编码 → `t('...')` | 15 个 Section 组件 | Todo |
| T11b-04 | 批量更新 UI 组件：SectionHeader / Tag / TabNav 等 | 5 个 UI 组件 | Todo |
| T11b-05 | 更新 DemoModal 3 步骤：表单标签 / 错误提示 / 成功态 | 5 个 Modal 组件 | Todo |
| T11b-06 | NavBar：追加语言切换器下拉（3 个语言选项）| NavBar.jsx + .module.css | Todo |
| T11b-07 | NavBar：追加主题切换按钮（☀️ / 🌙）| NavBar.jsx | Todo |
| T11b-08 | 各组件 `.module.css`：补充暗色样式（卡片、输入框、弹窗等）| 逐个 CSS 文件 | Todo |
| T11b-09 | 回归验收：全量功能测试（中/英/繁 × 亮/暗 = 6 种组合）| — | Todo |

## 语言切换器 UI 规格

```jsx
// NavBar 右侧，登录按钮前
<div className={styles.langSwitcher}>
  <button className={styles.langBtn} onClick={toggleLangMenu}>
    🌐 {LANG_LABELS[locale]}  ▾
  </button>
  {langMenuOpen && (
    <div className={styles.langMenu}>
      <button onClick={() => setLocale('zh')}>简体中文</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh-TW')}>繁體中文</button>
    </div>
  )}
</div>
```

## 主题切换按钮 UI 规格

```jsx
// NavBar 右侧，语言切换器旁
<button
  className={styles.themeBtn}
  onClick={toggleTheme}
  aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

## 暗色样式补充重点

| 组件 | 需补充的暗色规则 |
|------|----------------|
| ProductCard | `.card` → `background: var(--card-bg); border-color: var(--card-border)` |
| TestimonialCard | 同上 |
| ResourceCard | 同上 |
| MetricCard | `background: rgba(255,255,255,0.06)` → 已适配，验证即可 |
| DemoModal | `.modal` → `background: var(--card-bg)` |
| SearchModal | 同上 |
| ModalStep1 inputs | `.mfi` → `background: var(--gray-100); color: var(--gray-900)` |
| SectionHeader | `.title` → `color: var(--gray-900)` (已用变量，验证) |

## 验收矩阵（6 种组合）

| | 简体中文 | English | 繁體中文 |
|--|---------|---------|---------|
| **亮色** | ✅ 基准 | ✅ 全英文 | ✅ 繁体 |
| **暗色** | ✅ 深色背景 | ✅ 双重 | ✅ 双重 |

每种组合检验：NavBar / Hero / 产品矩阵 / 弹窗 / 页脚
