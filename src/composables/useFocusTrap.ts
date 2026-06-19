/**
 * useFocusTrap — 焦点陷阱 + 初始焦点 + 焦点恢复
 * 用于模态框、侧边栏等覆盖层，确保键盘焦点不逃逸到背景页面。
 *
 * @param {Ref<boolean> | (() => boolean)} isActive   - 是否激活陷阱
 * @param {Ref<HTMLElement|null> | (() => HTMLElement|null)} containerRef - 陷阱容器 ref
 */
import { ref, watch, onUnmounted, toValue } from 'vue';
import type { Ref, WatchSource, MaybeRef } from 'vue';

export function useFocusTrap(isActive: WatchSource<boolean>, containerRef: MaybeRef<HTMLElement | null>) {
  const prevFocusRef: Ref<HTMLElement | null> = ref(null);
  let removeKeyListener: (() => void) | null = null;

  const restoreFocus = () => {
    if (prevFocusRef.value && typeof prevFocusRef.value.focus === 'function') {
      const id = setTimeout(() => prevFocusRef.value?.focus?.(), 0);
      return () => clearTimeout(id);
    }
  };

  watch(isActive, (active) => {
    if (typeof document === 'undefined') return;
    if (!active) {
      if (removeKeyListener) {
        removeKeyListener();
        removeKeyListener = null;
      }
      restoreFocus();
      return;
    }

    prevFocusRef.value = document.activeElement as HTMLElement | null;
    const container = toValue(containerRef);
    if (!container) return;

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !('disabled' in el && (el as HTMLButtonElement).disabled) && el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    removeKeyListener = () => document.removeEventListener('keydown', onKey);

    const focusable = getFocusable();
    const focusTarget = focusable[0] || container;
    focusTarget.focus?.();
  }, { immediate: true });

  onUnmounted(() => {
    if (removeKeyListener) {
      removeKeyListener();
      removeKeyListener = null;
    }
    restoreFocus();
  });
}
