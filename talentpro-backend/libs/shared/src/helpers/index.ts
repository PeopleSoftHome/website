/**
 * 通用工具函数
 * 实际实现位于 apps/api/src/common/helpers，此处 re-export 供跨项目复用识别。
 */
export { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';
export type { PaginatedResult } from '@/common/helpers/pagination.helper';
