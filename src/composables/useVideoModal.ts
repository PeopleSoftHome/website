/**
 * useVideoModal — 视频弹窗状态管理
 * 与 useStepModal 同模式，但更简单（无 step / isSuccess）
 */
import { ref } from 'vue';

export function useVideoModal() {
  const isOpen = ref(false);
  const openVideo = () => { isOpen.value = true; };
  const closeVideo = () => { isOpen.value = false; };
  return { isOpen, openVideo, closeVideo };
}
