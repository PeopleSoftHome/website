/**
 * VideoModal Store — 视频弹窗状态管理
 * 包装 useVideoModal composable 为 provide-ready 对象
 */
import { useVideoModal } from '@/composables/useVideoModal.js';

export function createVideoModal() {
  return useVideoModal();
}
