/**
 * VideoModal Store — Pinia 版视频弹窗状态管理
 * 包装 useVideoModal composable 为全局单例 Store
 */
import { defineStore } from 'pinia';
import { useVideoModal } from '@/composables/useVideoModal';

export const useVideoModalStore = defineStore('videoModal', () => useVideoModal());
