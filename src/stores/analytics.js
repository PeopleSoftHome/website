/**
 * Analytics Store — 包装 useAnalytics 为 provide-ready 对象
 */
import { useAnalytics } from '@/composables/useAnalytics.js';

export function createAnalytics() {
  return useAnalytics();
}
