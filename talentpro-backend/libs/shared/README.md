# libs/shared — 后端可复用能力层

本库存放 NestJS 后端中可跨项目复用的基础设施代码，与 TalentPro 业务域解耦。
业务代码统一从 `@shared/*` 导入；旧路径（`@/common/...`）的兼容性 re-export 已于 v4.3.3 清理移除。

## 子目录

| 目录 | 说明 | 代表模块 |
|------|------|----------|
| `repositories/` | Base CRUD Repository | `base-crud.repository.ts` |
| `prisma/` | Prisma 扩展（软删除、PII 加密、多租户预留） | `prisma.service.ts`、`prisma.module.ts`、`soft-delete.extension.ts`、`field-encryption.extension.ts`、`workspace.storage.ts` |
| `helpers/` | 分页、响应包装等通用工具 | `pagination.helper.ts` |
| `guards/` | 认证/权限/IP 过滤/角色 Guard | `jwt-auth.guard.ts`、`permission.guard.ts`、`ip-filter.guard.ts`、`roles.guard.ts` |
| `decorators/` | 缓存、权限、公共路由、当前用户装饰器 | `cache.decorator.ts`、`permission.decorator.ts`、`public.decorator.ts`、`roles.decorator.ts`、`current-user.decorator.ts` |
| `interceptors/` | 响应包装、缓存、审计、指标拦截器 | `transform.interceptor.ts`、`cache.interceptor.ts`、`cache-control.interceptor.ts`、`audit.interceptor.ts`、`metrics.interceptor.ts` |
| `redis/` | Redis 客户端模块 | `redis.module.ts` |
| `metrics/` | Prometheus 指标模块 | `metrics.module.ts`、`metrics.controller.ts`、`prometheus.service.ts` |
| `types/` | 通用类型 | `types.ts` |

## 迁移到其它项目

1. 复制 `libs/shared/` 到新 NestJS monorepo。
2. 在 `nest-cli.json` 中注册 `shared` library。
3. 在 `tsconfig.json` 与 Jest `moduleNameMapper` 中配置 `@shared/*` path alias。
4. 根据新项目模型调整 `PrismaService` 与扩展的模型列表。
