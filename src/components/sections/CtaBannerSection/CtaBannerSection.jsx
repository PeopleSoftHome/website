import { useModalContext } from '../../../context/ModalContext';
import { useI18n }         from '../../../i18n/index';
import RevealWrapper       from '../../ui/RevealWrapper/RevealWrapper';
import styles              from './CtaBannerSection.module.css';

export default function CtaBannerSection() {
  const { openModal } = useModalContext();
  const { t }         = useI18n();
  return (
    <section className={styles.section} id="cta">
      <div className={styles.glow} aria-hidden="true" />
      <div className="container">
        <RevealWrapper className={styles.content}>
          <h2 className={styles.title}>{t('cta.title')}</h2>
          <p  className={styles.subtitle}>{t('cta.sub')}</p>
          <div className={styles.btns}>
            <button className={styles.btnWhite}   onClick={openModal}>{t('cta.btn1')}</button>
            <button className={styles.btnOutline} onClick={openModal}>{t('cta.btn2')}</button>
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
