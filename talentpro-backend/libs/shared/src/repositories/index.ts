/**
 * 可复用 Base CRUD Repository
 * 实际实现位于 apps/api/src/common/repositories，此处 re-export 供跨项目复用识别。
 */
export { BaseCrudRepository } from '@/common/repositories/base-crud.repository';
export type { FindAllOptions } from '@/common/repositories/base-crud.repository';
