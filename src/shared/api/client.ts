/**
 * 可复用 Axios 客户端
 * 实际实现位于 @/api/client，此处 re-export 供跨项目复用识别。
 */
export { apiClient, createRequestController } from '@/api/client';
