import { useState, useCallback } from 'react';

/**
 * useVideoModal — 视频弹窗状态管理 Hook
 * 与 useModal 同模式，但更简单（无 step / isSuccess）
 *
 * v2.3.2 Phase 2：ESC / body scroll lock 已下沉至 BaseModal，本 Hook 仅负责状态。
 */
export function useVideoModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openVideo  = useCallback(() => setIsOpen(true),  []);
  const closeVideo = useCallback(() => setIsOpen(false), []);

  return { isOpen, openVideo, closeVideo };
}
