/**
 * 前端 API 共享层聚合导出
 * 实际实现位于本目录，外部可通过 `@/shared/api/*` 直接引用。
 */
export { API_BASE_URL } from './baseUrl';
export { apiClient, createRequestController } from './client';
