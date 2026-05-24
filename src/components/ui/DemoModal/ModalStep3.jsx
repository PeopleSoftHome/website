import { useI18n } from '../../../i18n/index';
import { useState } from 'react';
import styles from './DemoModal.module.css';

/**
 * ModalStep3 — 企业规模（单选 Pills，默认第二项）
 */
export default function ModalStep3({ onSubmit }) {
  const { t } = useI18n();
  const SCALES = t('modal.scales') || [];
  const [selected, setSelected] = useState(SCALES[1] || '');

  return (
    <div>
      <div className={styles.stepTitle}>{t('modal.step3Title')}</div>
      <div className={styles.stepSub}>{t('modal.step3Sub')}</div>

      <div className={styles.pills}>
        {SCALES.map(s => (
          <button
            key={s}
            className={`${styles.pill} ${selected === s ? styles.pillSelected : ''}`}
            onClick={() => setSelected(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button className={styles.submitBtn} onClick={onSubmit}>
        {t('modal.submit')}
      </button>
    </div>
  );
}
