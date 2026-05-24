import { useI18n } from '../../../i18n/index';
import { useState } from 'react';
import styles from './DemoModal.module.css';

/**
 * ModalStep2 — 产品选择（多选 Pills，默认选中第一项）
 */
export default function ModalStep2({ onNext }) {
  const { t } = useI18n();
  const PRODUCTS = t('modal.products') || [];
  const [selected, setSelected] = useState(() => new Set(PRODUCTS.slice(0, 1)));

  const toggle = (p) => setSelected(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  return (
    <div>
      <div className={styles.stepTitle}>{t('modal.step2Title')}</div>
      <div className={styles.stepSub}>{t('modal.step2Sub')}</div>

      <div className={styles.pills}>
        {PRODUCTS.map(p => (
          <button
            key={p}
            className={`${styles.pill} ${selected.has(p) ? styles.pillSelected : ''}`}
            onClick={() => toggle(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <button className={styles.submitBtn} onClick={onNext}>
        {t('modal.next')}
      </button>
    </div>
  );
}
