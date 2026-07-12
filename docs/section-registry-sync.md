# Section Registry 同步指南

> **版本**：v4.3.0  
> 说明：Admin 配置首页 Section 时，需要同时维护 Admin 与 Portal 两侧的 Section 注册表。本文档说明同步规则。

---

## 两份注册表

| 位置 | 用途 | 关键导出 |
|------|------|----------|
| `talentpro-admin/src/data/sectionRegistry.js` | Admin 表单渲染、schema、默认配置 | `REGISTERED_SECTIONS`, `defaultConfig`, `configSchema` |
| `src/utils/sectionRegistry.ts` | Portal 运行时懒加载 Section 组件 | `registerSection`, `getSectionConfig`, `DEFAULT_ORDER` |

---

## 新增 Section 的流程

1. **创建 Section 组件**：在 `src/components/sections/{Name}Section/` 实现 UI。
2. **Portal 注册**：在 `src/utils/sectionRegistry.ts` 的 `REGISTERED_SECTIONS` 中添加：

   ```ts
   REGISTERED_SECTIONS[name] = {
     component: () => import('@/components/sections/NewSection/NewSection.vue'),
     defaultConfig: { title: '', subtitle: '' },
   };
   ```

3. **Admin 注册**：在 `talentpro-admin/src/data/sectionRegistry.js` 中同步添加：

   ```js
   REGISTERED_SECTIONS[name] = {
     label: '新模块',
     icon: 'Star',
     defaultConfig: { title: '', subtitle: '' },
     configSchema: [
       { key: 'title', label: '标题', type: 'input' },
       { key: 'subtitle', label: '副标题', type: 'textarea' },
     ],
   };
   ```

4. **验证**：
   - Portal 首页能渲染新 Section；
   - Admin「首页配置」能正确显示表单；
   - 保存配置后 Portal 读取 CMS 数据正常渲染。

---

## 同步原则

- `key` 必须完全一致（大小写敏感）。
- `defaultConfig` 两侧必须一致，避免 Admin 保存后 Portal 解析失败。
- `configSchema` 中的 `type` 必须是 `SectionConfigForm.vue` 支持的类型：`input`、`textarea`、`switch`、`image-upload`。
- 新增字段后，若旧数据缺少该字段，Portal 组件需做 fallback 处理。

---

## 常见错误

| 现象 | 原因 | 修复 |
|------|------|------|
| Admin 保存后 Portal 不显示 | `key` 不一致 | 统一命名 |
| 表单字段与渲染不一致 | `configSchema` 与组件 props 不匹配 | 同步字段 key |
| 默认配置不生效 | 两侧 `defaultConfig` 不一致 | 对齐默认值 |
