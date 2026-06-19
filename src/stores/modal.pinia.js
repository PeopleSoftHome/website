/**
 * Modal Store — Pinia 版预约演示弹窗状态管理
 * 包装 useModal composable 为全局单例 Store
 */
import { defineStore } from 'pinia';
import { useModal } from '@/composables/useModal.js';

export const useModalStore = defineStore('modal', () => useModal());
