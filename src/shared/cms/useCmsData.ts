/**
 * 可复用 CMS 数据获取 + fallback 注册表
 * 实际实现位于 @/composables/useCmsData，此处 re-export 供跨项目复用识别。
 */
export {
  useCmsData,
  useCmsDataByKey,
  registerFallbackModule,
  registerCmsFetcher,
} from '@/composables/useCmsData';
