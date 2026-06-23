/**
 * Modal Store — Pinia 版预约演示弹窗状态管理
 * 包装 useDemoBooking composable 为全局单例 Store
 */
import { defineStore } from 'pinia';
import { useDemoBooking } from '@/composables/useDemoBooking';

export const useModalStore = defineStore('modal', () => useDemoBooking());
