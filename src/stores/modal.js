/**
 * Modal Store — 预约演示弹窗状态管理
 * 包装 useModal composable 为 provide-ready 对象
 */
import { useModal } from '@/composables/useModal.js';

export function createModal() {
  return useModal();
}
