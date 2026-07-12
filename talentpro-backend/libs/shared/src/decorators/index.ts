/**
 * 通用装饰器
 * 实际实现位于 apps/api/src/common/decorators，此处 re-export 供跨项目复用识别。
 */
export { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';
export { Public } from '@/common/decorators/public.decorator';
export { Roles } from '@/common/decorators/roles.decorator';
export { Permission, PermissionMode } from '@/common/decorators/permission.decorator';
