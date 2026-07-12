/**
 * SSR-safe 工具函数
 * 实际实现位于 @/utils，此处 re-export 供跨项目复用识别。
 */
export { injectJsonLd, removeJsonLd, useJsonLd } from '@/utils/jsonld';
export { formatDate, formatRelativeTime } from '@/utils/date';
