import { useModalContext } from '../../../context/ModalContext';
import { useNavScroll }    from '../../../hooks/useNavScroll';
import { useI18n }         from '../../../i18n/index';
import styles              from './FloatingBar.module.css';

/**
 * FloatingBar v2.3.1
 * 桌面右侧竖排 + 移动端底部横排
 *
 * 按钮职责：
 *   📅 预约演示  → DemoModal
 *   💬 在线咨询  → ChatBot（智能客服 + 人工接入）
 *   📞 电话      → ContactModal（电话号码 + 二维码卡片）
 *   ↑  回到顶部  → scrollTo
 */
export default function FloatingBar({ onOpenChat, onOpenContact }) {
  const { openModal }   = useModalContext();
  const { showBackTop } = useNavScroll();
  const { t }           = useI18n();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* 桌面：右侧竖排 */}
      <div className={styles.bar}>
        <FloatBtn icon="📅" label={t('floatingBar.demo')}    onClick={openModal} />
        <FloatBtn icon="💬" label={t('floatingBar.chat')}    onClick={onOpenChat} />
        <FloatBtn icon="📞" label={t('floatingBar.phone')}   onClick={onOpenContact} />
        <FloatBtn
          icon="↑"
          label={t('floatingBar.backTop')}
          onClick={scrollToTop}
          className={showBackTop ? '' : styles.hidden}
        />
      </div>

      {/* 移动端：底部横排 */}
      <div className={styles.mobileBar}>
        <button className={styles.mobBtn} onClick={onOpenContact}>
          <span className={styles.mobIcon}>📞</span>
          {t('floatingBar.callTel')}
        </button>
        <button className={styles.mobBtn} onClick={onOpenChat}>
          <span className={styles.mobIcon}>💬</span>
          {t('floatingBar.chat')}
        </button>
        <button className={styles.mobCta} onClick={openModal}>
          {t('floatingBar.demo')} →
        </button>
      </div>
    </>
  );
}

function FloatBtn({ icon, label, onClick, className = '' }) {
  return (
    <button
      className={[styles.btn, className].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.btnIcon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
