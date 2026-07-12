# Admin 可复用组件 API

> **版本**：v4.3.0  
> 说明：本文档汇总 `talentpro-admin/src/components/` 中适合跨项目复用的核心组件，含 props、事件、插槽与使用示例。

---

## CmsTable

路径：`talentpro-admin/src/components/CmsTable.vue`

声明式 CMS CRUD 表格，集成分页、创建/编辑弹窗、批量删除、AI 辅助。

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiUrl` | `string` | 是 | REST API 基础路径，如 `/api/v1/admin/blogs` |
| `columns` | `Array<{prop,label,type?,width?,minWidth?,formatter?}>` | 是 | 表格列配置 |
| `formFields` | `Array<{prop,label,type?,placeholder?,rows?,min?}>` | 是 | 表单字段配置 |
| `responseAdapter` | `Function` | 否 | 响应适配器：`(res) => { items, total }` |
| `rules` | `Object` | 否 | Element Plus 表单校验规则 |
| `selection` | `boolean` | 否 | 是否开启批量选择，默认 `false` |
| `pageSize` | `number` | 否 | 每页条数，默认 `20` |
| `apiParams` | `Object` | 否 | 固定查询参数 |
| `aiAssist` | `boolean \| Object \| string` | 否 | 是否显示 AI 辅助按钮；对象可传 `{ type }` |

### 事件 / 插槽

| 名称 | 类型 | 说明 |
|------|------|------|
| `column-${prop}` | 插槽 | 自定义列渲染，参数 `{ row }` |
| `form-field-${prop}` | 插槽 | 自定义表单字段渲染，参数 `{ field, form }` |
| `actions` | 插槽 | 自定义操作列，参数 `{ row }` |

### Expose

| 方法 | 说明 |
|------|------|
| `setParams(params)` | 设置查询参数并刷新 |
| `params` | 当前查询参数 |
| `fetch()` | 手动拉取数据 |
| `refresh()` | 刷新当前页 |

### 使用示例

```vue
<CmsTable
  api-url="/api/v1/admin/blogs"
  :columns="[
    { prop: 'title', label: '标题' },
    { prop: 'published', label: '已发布', type: 'switch' },
  ]"
  :form-fields="[
    { prop: 'title', label: '标题', type: 'input' },
    { prop: 'content', label: '正文', type: 'textarea' },
  ]"
  :ai-assist="{ type: 'blog' }"
/>
```

---

## SectionConfigForm

路径：`talentpro-admin/src/components/SectionConfigForm.vue`

根据 `configSchema` 自动渲染表单：input、textarea、switch、image-upload。

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `modelValue` | `Object` | 是 | 当前配置对象 |
| `schema` | `Array<{key,label,type?,options?}>` | 是 | 字段 schema |

### 事件

| 名称 | 说明 |
|------|------|
| `update:modelValue` | 配置变更 |

---

## ImageUpload

路径：`talentpro-admin/src/components/ImageUpload.vue`

图片上传组件，支持本地上传与 DALL·E AI 生成。

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `modelValue` | `string` | 是 | 图片 URL |
| `aiPrompt` | `string` | 否 | 默认 AI 生成提示词 |

### 事件

| 名称 | 说明 |
|------|------|
| `update:modelValue` | URL 变更 |

---

## AiAssistButton / AiAssistDialog

路径：

- `talentpro-admin/src/components/AiAssistButton.vue`
- `talentpro-admin/src/components/AiAssistDialog.vue`

为表单字段提供 AI 草稿生成（标题、摘要、正文、SEO、翻译、审核）。

### AiAssistButton Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | `blog` / `news` / `product` / `email` / `translate` / `moderate` 等 |
| `payload` | `Object` | 是 | `{ title, content }` |
| `visible` | `boolean` | 是 | 是否显示（v-model） |

---

## menu.config.js

路径：`talentpro-admin/src/config/menu.config.js`

Admin 路由、侧边栏、面包屑的单一数据源。

### 菜单项 Schema

```js
{
  path: '/dashboard',          // 路由路径（可选，有子菜单时可省略）
  label: 'menu.dashboard',     // i18n key
  icon: 'DataLine',            // Element Plus 图标名
  roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  permissions: ['dashboard:read'],
  permissionMode: 'any',       // 'any' | 'all'
  children: [...],             // 子菜单（可选）
}
```

### 导出

- `menuConfig`：菜单数组
- `buildRoutes()`：生成 Vue Router routes
- `hasMenuPermission(item, userRole, auth)`：权限校验
- `flattenMenu(items)`：扁平化菜单

---

## 迁移到其它项目

1. 复制 `talentpro-admin/src/components/CmsTable.vue` 及其依赖（`useCrud.js`、`ImageUpload.vue`、`AiAssistButton.vue`）。
2. 替换 `client.js` 为项目的 API 客户端。
3. 替换 Element Plus 为项目 UI 库，或保留 Element Plus 依赖。
4. 同步 `menu.config.js` 的 roles/permissions 体系。
