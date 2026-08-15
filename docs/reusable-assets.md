# TalentPro 可复用资产清单

> **版本**：v4.4.2  
> 说明：梳理前后端可跨项目复用的模块、迁移路径与合并注意事项。

---

## 前端门户（`src/shared/`）

| 模块 | 路径 | 复用价值 | 迁移注意 |
|------|------|----------|----------|
| API 客户端 | `src/shared/api/client.ts` | 统一响应解包、401 refresh、错误处理 | 替换 baseURL 与 storage key |
| CMS 数据层 | `src/shared/cms/useCmsData.ts` | API + fallback 注册表 | 替换 CMS fetcher 与 fallback 模块 |
| 主题 | `src/shared/composables/index.ts` | 暗色/亮色切换 | 替换 CSS 变量体系 |
| 搜索 | `src/shared/composables/index.ts` | Cmd+K 本地搜索 | 替换搜索索引与 API |
| 站点配置 | `src/shared/composables/index.ts` | 后端化站点配置 | 替换 `/system/config/public` 接口 |
| 弹窗底座 | `src/shared/composables/index.ts` | 焦点陷阱、滚动锁定 | 无特殊依赖 |
| JSON-LD / 日期 | `src/shared/utils/index.ts` | SEO、时间格式化 | 替换 locale |

---

## 后端 API（`talentpro-backend/libs/shared/`）

| 模块 | 路径 | 复用价值 | 迁移注意 |
|------|------|----------|----------|
| Base CRUD Repository | `libs/shared/src/repositories/` | 通用 CRUD + 分页 | 调整 Prisma 模型名映射 |
| 软删除扩展 | `libs/shared/src/prisma/` | 自动注入 `deletedAt` | 配置 `SOFT_DELETE_MODELS` |
| PII 加密扩展 | `libs/shared/src/prisma/` | AES-256-GCM 字段级加密 | 配置加密字段列表与密钥 |
| 分页工具 | `libs/shared/src/helpers/` | `getSkip` / `buildPaginatedResponse` | 无 |
| JWT / 权限 / IP Guard | `libs/shared/src/guards/` | 认证与授权 | 调整角色/权限体系 |
| 缓存 / 公共 / 权限装饰器 | `libs/shared/src/decorators/` | `@Cacheable`、`@Public`、`@Permission` | 无 |
| Transform / Cache / Audit 拦截器 | `libs/shared/src/interceptors/` | 响应包装、缓存、审计 | 调整 `ROUTE_MODEL_MAP` |

---

## 管理后台

| 模块 | 路径 | 复用价值 |
|------|------|----------|
| CmsTable | `talentpro-admin/src/components/ui/CmsTable.vue` | 声明式 CRUD 表格 |
| SectionConfigForm | `talentpro-admin/src/components/page-config/SectionConfigForm.vue` | Schema 驱动表单 |
| ImageUpload | `talentpro-admin/src/components/ui/ImageUpload.vue` | 上传 + AI 生成图片 |
| AiAssistButton | `talentpro-admin/src/components/ai/AiAssistButton.vue` | AI 内容生成 |
| AiConfigAssistant | `talentpro-admin/src/components/ai/AiConfigAssistant.vue` | Admin 配置助手聊天面板 |
| menu.config.ts | `talentpro-admin/src/config/menu.config.ts` | 路由/菜单/面包屑同源 |
| permission.config.ts | `talentpro-admin/src/config/permission.config.ts` | 权限矩阵 |

---

## 不推荐复用的部分

以下模块与 TalentPro 业务域强耦合，合并时应留在原项目或重写：

- `prisma/schema.prisma` 中的 HR 业务模型（ProductTab、WhyUsTab、DemoBooking 等）
- `apps/api/src/modules/` 各业务模块（cms、lead、blog、forum、marketplace、payment）
- `src/data/` 静态 fallback 数据
- `src/components/sections/` 首页 Section 组件
- `seed.ts` / `seed-rich-data.ts` 种子脚本

---

## 合并策略建议

1. **整体迁移**：把 `src/shared/`、`libs/shared/`、可复用 Admin 组件整体复制到新项目。
2. **渐进融合**：新项目先通过 re-export 引用旧模块，再逐步替换实现。
3. **避免直接复制业务模型**：HR 领域模型应在新项目重新设计，仅复用基础设施。
