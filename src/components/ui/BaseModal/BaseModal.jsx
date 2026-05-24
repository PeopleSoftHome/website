import { useEffect, useRef } from 'react';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

/**
 * BaseModal — 弹窗通用骨架
 *
 * 统一管理：
 *   - 条件渲染（isOpen）
 *   - body 滚动锁定（引用计数，多弹窗共存安全）
 *   - ESC 键关闭
 *   - 遮罩点击关闭
 *   - role="dialog" / aria-modal / aria-label
 *
 * 用法：
 *   <BaseModal isOpen={isOpen} onClose={close} ariaLabel={t('...')} overlayClassName={styles.overlay}>
 *     <div className={styles.modal}>...</div>
 *   </BaseModal>
 */
export default function BaseModal({
  isOpen,
  onClose,
  ariaLabel,
  overlayClassName,
  children,
}) {
  const overlayRef = useRef(null);
  useScrollLock(isOpen);
  useFocusTrap(isOpen, overlayRef);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={overlayClassName}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
