import { computed } from 'vue';
import { useSiteConfig } from './useSiteConfig';

/**
 * 功能开关 Composable
 * 读取后端 /system/config/public 返回的 featureFlags 对象。
 * 未获取到配置时默认返回 false，避免未发布功能提前暴露。
 */
export function useFeatureFlag(key: string) {
  const { featureFlags } = useSiteConfig();
  return computed(() => !!featureFlags.value?.[key]);
}
