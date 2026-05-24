import { useState, useCallback, useRef, useEffect } from 'react';
import { NAV_LINKS } from '../../../data/navigation';
import { useModalContext } from '../../../context/ModalContext';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import styles from './MobileMenu.module.css';

/**
 * MobileMenu — 移动端全屏导航菜单
 * 修复 BUG-01：完整实现 Hamburger → 全屏菜单 → Accordion 子菜单
 *
 * @param {boolean} isOpen    - 菜单是否打开
 * @param {function} onClose  - 关闭回调
 */
export default function MobileMenu({ isOpen, onClose }) {
  const { openModal } = useModalContext();
  const menuRef = useRef(null);
  const [expandedId, setExpandedId] = useState(null);

  useFocusTrap(isOpen, menuRef);

  /* ── Escape 关闭 ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const toggleSubmenu = useCallback((id) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  const handleCta = useCallback(() => {
    onClose();
    openModal();
  }, [onClose, openModal]);

  return (
    <>
      {/* 遮罩 */}
      <div
        className={[styles.overlay, isOpen ? styles.overlayOpen : ''].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 菜单主体 */}
      <div
        ref={menuRef}
        className={[styles.menu, isOpen ? styles.menuOpen : ''].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="导航菜单"
      >
        <div className={styles.body}>
          {NAV_LINKS.map((link) => {
            if (!link.hasDropdown) {
              return (
                <a key={link.id} href={link.href} className={styles.directLink} onClick={onClose}>
                  {link.label}
                </a>
              );
            }

            const isExpanded = expandedId === link.id;
            return (
              <div key={link.id} className={styles.navItem}>
                <button
                  className={styles.navHeader}
                  onClick={() => toggleSubmenu(link.id)}
                  aria-expanded={isExpanded}
                >
                  <span>{link.label}</span>
                  <span className={[styles.arrow, isExpanded ? styles.arrowOpen : ''].join(' ')}>
                    ▾
                  </span>
                </button>

                {/* Accordion 子菜单 */}
                <div
                  className={styles.submenu}
                  style={{ maxHeight: isExpanded ? '400px' : '0' }}
                  aria-hidden={!isExpanded}
                >
                  {link.items?.map((item) => (
                    <a key={item.title} href={item.href} className={styles.subItem} onClick={onClose}>
                      <span className={styles.subIcon}>{item.icon}</span>
                      <span className={styles.subText}>
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部 CTA 区 */}
        <div className={styles.footer}>
          <div className={styles.phone}>
            售前咨询 <strong>400-888-8888</strong>
          </div>
          <button className={styles.cta} onClick={handleCta}>
            预约演示 →
          </button>
        </div>
      </div>
    </>
  );
}
