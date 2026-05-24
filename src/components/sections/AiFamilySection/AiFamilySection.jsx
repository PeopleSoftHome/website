import { AI_CARDS, AI_BANNER }   from '../../../data/aiFamily';
import { useModalContext }       from '../../../context/ModalContext';
import { useI18n }               from '../../../i18n/index';
import { AI_CARD_KEY_MAP }       from '../../../i18n/keyMap';
import RevealWrapper             from '../../ui/RevealWrapper/RevealWrapper';
import AiCard                    from './AiCard';
import styles                    from './AiFamilySection.module.css';

export default function AiFamilySection() {
  const { openModal } = useModalContext();
  const { t }         = useI18n();

  return (
    <section className={styles.section} id="ai">
      <div className={styles.dots} aria-hidden="true" />
      <div className="container">
        <RevealWrapper className={styles.header}>
          <span className={styles.tag}>{t('aiFamily.sectionTag')}</span>
          <h2 className={styles.title}>{t('aiFamily.sectionTitle')}</h2>
          <p className={styles.subtitle}>{t('aiFamily.sectionSub')}</p>
        </RevealWrapper>

        <div className={styles.grid}>
          {AI_CARDS.map((card, i) => {
            const k = AI_CARD_KEY_MAP[card.id];
            return (
              <AiCard
                key={card.id}
                icon={card.icon}
                name={k ? t(`aiFamily.cards.${k}.name`)    : card.name}
                tagline={k ? t(`aiFamily.cards.${k}.tagline`) : card.tagline}
                linkText={t('aiFamily.linkText')}
                hot={card.hot}
                hotLabel={t('aiFamily.hotBadge')}
                delay={i}
              />
            );
          })}

          {/* Banner 卡 */}
          <RevealWrapper className={styles.bannerCard}>
            <div className={styles.bannerInner}>
              <div>
                <div className={styles.bannerLabel}>{t('aiFamily.banner.label')}</div>
                <div className={styles.bannerTitle}>{t('aiFamily.banner.title')}</div>
                <div className={styles.bannerSub}>{t('aiFamily.banner.sub')}</div>
              </div>
              <button className={styles.bannerCta} onClick={openModal}>
                {t('aiFamily.banner.cta')}
              </button>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
