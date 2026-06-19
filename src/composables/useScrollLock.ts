/**
 * useScrollLock — 全局 body 滚动锁定（引用计数器）
 *
 * 多个弹窗同时打开时，计数器递增；最后一个弹窗关闭时才恢复滚动。
 * 避免弹窗 A 关闭时恢复滚动，但弹窗 B 仍打开的问题。
 *
 * @param {Ref<boolean> | (() => boolean)} isLocked - 锁定状态 ref 或 getter
 */
import { watch, onUnmounted } from 'vue';

let lockCount = 0;
let originalOverflow = '';

function lock() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function unlock() {
  if (typeof document === 'undefined') return;
  if (lockCount > 0) {
    lockCount--;
    if (lockCount === 0) {
      document.body.style.overflow = originalOverflow;
    }
  }
}

export function useScrollLock(isLocked) {
  watch(isLocked, (locked) => {
    if (locked) lock();
    else unlock();
  }, { immediate: true });

  onUnmounted(() => {
    const currentlyLocked = typeof isLocked === 'function' ? isLocked() : isLocked.value;
    if (currentlyLocked) unlock();
  });
}

/* istanbul ignore next — test helper */
export function __resetScrollLockState() {
  lockCount = 0;
  originalOverflow = '';
}
