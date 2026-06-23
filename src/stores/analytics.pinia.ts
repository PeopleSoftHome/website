/**
 * Analytics Store — Pinia 版埋点状态管理
 * 包装 useAnalytics composable 为全局单例 Store
 */
import { defineStore } from 'pinia';
import { useAnalytics } from '@/composables/useAnalytics';

export const useAnalyticsStore = defineStore('analytics', () => useAnalytics());
