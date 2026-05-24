import { useI18n } from '../../../i18n/index';
import BaseModal from '../BaseModal/BaseModal';
import styles from './ContactModal.module.css';

/**
 * ContactModal — 在线咨询联系卡片弹窗（v2.3.2 Phase 2 国际化）
 * z-index: 2100（高于 DemoModal 2000）
 */
export default function ContactModal({ isOpen, onClose }) {
  const { t } = useI18n();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t('contact.ariaLabel')}
      overlayClassName={styles.overlay}
    >
      <div className={styles.card}>
        <button className={styles.close} onClick={onClose} aria-label={t('modal.close')}>✕</button>

        <div className={styles.header}>
          <div className={styles.avatar}>💬</div>
          <div>
            <div className={styles.title}>{t('contact.title')}</div>
            <div className={styles.subtitle}>{t('contact.subtitle')}</div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* 电话 */}
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📞</span>
          <div>
            <div className={styles.contactLabel}>{t('contact.phoneLabel')}</div>
            <a className={styles.contactValue} href="tel:4008888888">400-888-8888</a>
          </div>
        </div>

        {/* 工作时间 */}
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>🕘</span>
          <div>
            <div className={styles.contactLabel}>{t('contact.timeLabel')}</div>
            <div className={styles.contactValue}>{t('contact.timeValue')}</div>
          </div>
        </div>

        {/* 微信 QR */}
        <div className={styles.qrWrap}>
          <div className={styles.qrBox}>
            {/* QR 占位 */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="1" y="1" width="78" height="78" rx="6"
                stroke="var(--gray-200)" strokeWidth="1.5"/>
              <rect x="10" y="10" width="22" height="22" rx="2"
                stroke="var(--primary)" strokeWidth="1.5" fill="none"/>
              <rect x="14" y="14" width="14" height="14" rx="1"
                fill="var(--primary-light)"/>
              <rect x="48" y="10" width="22" height="22" rx="2"
                stroke="var(--primary)" strokeWidth="1.5" fill="none"/>
              <rect x="52" y="14" width="14" height="14" rx="1"
                fill="var(--primary-light)"/>
              <rect x="10" y="48" width="22" height="22" rx="2"
                stroke="var(--primary)" strokeWidth="1.5" fill="none"/>
              <rect x="14" y="52" width="14" height="14" rx="1"
                fill="var(--primary-light)"/>
              <circle cx="52" cy="52" r="10"
                fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="1"/>
              <text x="52" y="56" textAnchor="middle"
                fontSize="10" fontWeight="700" fill="var(--primary)">微</text>
            </svg>
            <div className={styles.qrLabel}>{t('contact.qrWechat')}</div>
          </div>
          <div className={styles.qrBox}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="1" y="1" width="78" height="78" rx="6"
                stroke="var(--gray-200)" strokeWidth="1.5"/>
              <rect x="10" y="10" width="22" height="22" rx="2"
                stroke="var(--ai-purple)" strokeWidth="1.5" fill="none"/>
              <rect x="14" y="14" width="14" height="14" rx="1"
                fill="var(--ai-purple-lighter)"/>
              <rect x="48" y="10" width="22" height="22" rx="2"
                stroke="var(--ai-purple)" strokeWidth="1.5" fill="none"/>
              <rect x="52" y="14" width="14" height="14" rx="1"
                fill="var(--ai-purple-lighter)"/>
              <rect x="10" y="48" width="22" height="22" rx="2"
                stroke="var(--ai-purple)" strokeWidth="1.5" fill="none"/>
              <rect x="14" y="52" width="14" height="14" rx="1"
                fill="var(--ai-purple-lighter)"/>
              <circle cx="52" cy="52" r="10"
                fill="#F3E8FF" stroke="var(--ai-purple)" strokeWidth="1"/>
              <text x="52" y="56" textAnchor="middle"
                fontSize="10" fontWeight="700" fill="var(--ai-purple)">公</text>
            </svg>
            <div className={styles.qrLabel}>{t('contact.qrOfficial')}</div>
          </div>
        </div>

        <button className={styles.cta} onClick={onClose}>
          {t('contact.cta')}
        </button>
      </div>
    </BaseModal>
  );
}
