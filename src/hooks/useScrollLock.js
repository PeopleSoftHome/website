import { useEffect } from 'react';

/**
 * useScrollLock — 全局 body 滚动锁定（引用计数器）
 *
 * 多个弹窗同时打开时，计数器递增；最后一个弹窗关闭时才恢复滚动。
 * 避免弹窗 A 关闭时恢复滚动，但弹窗 B 仍打开的问题。
 */
let lockCount = 0;
let originalOverflow = '';

function lock() {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function unlock() {
  if (lockCount > 0) {
    lockCount--;
    if (lockCount === 0) {
      document.body.style.overflow = originalOverflow;
    }
  }
}

export function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      lock();
      return () => unlock();
    }
  }, [isLocked]);
}
