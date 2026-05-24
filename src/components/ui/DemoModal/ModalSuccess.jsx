import { useI18n } from '../../../i18n/index';
import styles from './DemoModal.module.css';

/**
 * ModalSuccess — 提交成功态（2.5s 自动关闭）
 */
export default function ModalSuccess() {
  const { t } = useI18n();
  const lines = t('modal.successSub').split('\n');
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>🎉</div>
      <div className={styles.successTitle}>{t('modal.successTitle')}</div>
      <p className={styles.successSub}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    </div>
  );
}
