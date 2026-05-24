import { useEffect, useRef } from 'react';

/**
 * useFocusTrap — 焦点陷阱 + 初始焦点 + 焦点恢复
 * 用于模态框、侧边栏等覆盖层，确保键盘焦点不逃逸到背景页面。
 *
 * @param {boolean} isActive   - 是否激活陷阱
 * @param {React.RefObject} containerRef - 陷阱容器 ref
 */
export function useFocusTrap(isActive, containerRef) {
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      // 关闭时恢复焦点
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === 'function') {
        // 延迟恢复，避免在关闭动画完成前抢走焦点
        const id = setTimeout(() => prevFocusRef.current?.focus?.(), 0);
        return () => clearTimeout(id);
      }
      return;
    }

    // 保存打开前的焦点元素
    prevFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.disabled && el.offsetParent !== null);

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    // 初始焦点：优先聚焦容器本身（如果可聚焦）或第一个可聚焦元素
    const focusable = getFocusable();
    const focusTarget = focusable[0] || container;
    focusTarget.focus?.();

    return () => document.removeEventListener('keydown', onKey);
  }, [isActive]);
}
