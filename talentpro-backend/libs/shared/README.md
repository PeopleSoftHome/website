# libs/shared — 后端可复用能力层

本库存放 NestJS 后端中可跨项目复用的基础设施代码，与 TalentPro 业务域解耦。

## 子目录

| 目录 | 说明 | 代表模块 |
|------|------|----------|
| `repositories/` | Base CRUD Repository | `base-crud.repository.ts` |
| `prisma/` | Prisma 扩展（软删除、PII 加密、多租户） | `soft-delete.extension.ts`, `field-encryption.extension.ts` |
| `helpers/` | 分页、响应包装等通用工具 | `pagination.helper.ts` |
| `guards/` | 认证/权限/IP 过滤 Guard | `jwt-auth.guard.ts`, `permission.guard.ts`, `ip-filter.guard.ts` |
| `decorators/` | 缓存、权限、公共路由装饰器 | `cache.decorator.ts`, `permission.decorator.ts`, `public.decorator.ts` |
| `interceptors/` | 响应包装、缓存、审计、指标拦截器 | `transform.interceptor.ts`, `cache.interceptor.ts` |

## 迁移到其它项目

1. 复制 `libs/shared/` 到新 NestJS monorepo。
2. 在 `nest-cli.json` 中注册 `shared` library。
3. 在 `tsconfig.json` 中配置 `@shared/*` path alias。
4. 根据新项目模型调整 `PrismaService` 与扩展的模型列表。
