/**
 * Theme Store — 主题状态管理
 * 包装 useTheme composable 为 provide-ready 对象
 */
import { useTheme } from '@/composables/useTheme.js';

export function createTheme() {
  return useTheme();
}
