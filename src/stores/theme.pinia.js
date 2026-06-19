/**
 * Theme Store — Pinia 版主题状态管理
 * 包装 useTheme composable 为全局单例 Store
 */
import { defineStore } from 'pinia';
import { useTheme } from '@/composables/useTheme.js';

export const useThemeStore = defineStore('theme', () => useTheme());
