# 国际化（i18n）贡献指南

> **版本**：v4.3.0  
> 说明：新增用户可见文本时，需同步维护三语言 key。Admin 后台与门户使用不同的 locale 文件，需分别处理。

---

## 门户多语言

文件位置：

- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/zh-TW.json`

### 新增 key 流程

1. 在 `zh-CN.json` 中添加中文原文。
2. 同步在 `en.json` 和 `zh-TW.json` 中添加对应翻译。
3. 在组件中使用 `t('path.to.key')` 或 `tm('path.to.key')`。
4. 运行 `npm run validate:versions` 检查三语言 key 是否对齐。

### 命名规范

- 点分路径，如 `whyUs.sectionTitle`、`marketplace.pricingShort.free`。
- 同一页面/模块下的 key 放在同一命名空间。
- 避免硬编码中文 fallback，如 `t('key') || '中文'`。

### 插值

使用 `{var}` 语法：

```json
{ "welcome": "欢迎，{name}" }
```

```vue
{{ t('welcome', { name: user.name }) }}
```

---

## Admin 多语言

文件位置：

- `talentpro-admin/src/i18n/locales/zh-CN.json`
- `talentpro-admin/src/i18n/locales/en.json`
- `talentpro-admin/src/i18n/locales/zh-TW.json`

### 新增 key 流程

1. 在 `talentpro-admin/src/i18n/locales/zh-CN.json` 添加中文。
2. 同步 `en.json` / `zh-TW.json`。
3. 在组件中使用 `t('key')`。

### 菜单 key

菜单标签统一放在 `menu.*` 命名空间，并在 `talentpro-admin/src/config/menu.config.js` 中引用。

---

## 验证

```bash
# 门户版本与 token 同步检查
npm run validate:versions
npm run validate:tokens
```

---

## 注意事项

- 新增 key 必须三语言同时添加，避免运行时 fallback 缺失。
- Admin 与门户 locale 文件独立，不要混用。
- 对于 CMS 化内容（如导航、站点配置），文本由后端/Admin 管理，不放在 locale 文件中。
