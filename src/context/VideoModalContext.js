import { createContext, useContext } from 'react';

/**
 * VideoModalContext — 全局视频弹窗状态
 * 与 ModalContext 完全解耦，互不干扰
 * 任意层级组件通过 useVideoModalContext() 调用 openVideo
 */
export const VideoModalContext = createContext({
  isOpen:     false,
  openVideo:  () => {},
  closeVideo: () => {},
});

export function useVideoModalContext() {
  return useContext(VideoModalContext);
}
