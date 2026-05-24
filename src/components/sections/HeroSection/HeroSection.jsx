import { useEffect, useRef } from 'react';
import { useModalContext }       from '../../../context/ModalContext';
import { useVideoModalContext }  from '../../../context/VideoModalContext';
import { useI18n }               from '../../../i18n/index';
import styles                    from './HeroSection.module.css';

export default function HeroSection() {
  const { openModal } = useModalContext();
  const { openVideo } = useVideoModalContext();
  const { t }         = useI18n();
  const num1Ref = useRef(null);
  const num2Ref = useRef(null);
  const num3Ref = useRef(null);

  useEffect(() => {
    const rafIds = [];

    const animateNum = (el, target, sfx = '') => {
      if (!el) return;
      let cur = 0;
      const step = () => {
        cur = Math.min(cur + Math.ceil(target / 30), target);
        el.textContent = cur + sfx;
        if (cur < target) {
          const id = requestAnimationFrame(step);
          rafIds.push(id);
        }
      };
      const id = requestAnimationFrame(step);
      rafIds.push(id);
    };

    const timer = setTimeout(() => {
      animateNum(num1Ref.current, 47);
      animateNum(num2Ref.current, 23);
      animateNum(num3Ref.current, 87, '%');
    }, 1200);

    return () => {
      clearTimeout(timer);
      rafIds.forEach(id => cancelAnimationFrame(id));
    };
  }, []);

  return (
    <section className={styles.hero} id="home">

      <div className={styles.bgGlow}    aria-hidden="true" />
      <div className={styles.bgGlowAi} aria-hidden="true" />
      <div className={`${styles.deco} ${styles.decoA}`} aria-hidden="true" />
      <div className={`${styles.deco} ${styles.decoB}`} aria-hidden="true" />
      <div className={`${styles.deco} ${styles.decoC}`} aria-hidden="true" />

      <div className="container">
        <div className={styles.inner}>
          <div className={styles.content}>
            <div className={styles.tag}>
              <span className={styles.tagDot} aria-hidden="true" />
              {t('hero.badge')}
            </div>
            <h1 className={styles.title}>
              {t('hero.title1')}<span className={styles.highlight}>{t('hero.titleAI')}</span>{t('hero.title2')}<br />{t('hero.titleLine2')}
            </h1>
            <p className={styles.subtitle}>{t('hero.subtitle')}</p>
            <div className={styles.ctas}>
              <button className={styles.ctaPrimary} onClick={openModal}>{t('hero.cta1')}</button>
              <button className={styles.ctaGhost}   onClick={openVideo}>{t('hero.cta2')}</button>
            </div>
            <div className={styles.trust}>
              {['trust1','trust2','trust3','trust4'].map(k => (
                <span key={k} className={styles.trustItem}>{t(`hero.${k}`)}</span>
              ))}
            </div>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.deviceFrame}>
              <div className={styles.deviceBar}>
                <span className={styles.dot} style={{background:'var(--window-red)'}} />
                <span className={styles.dot} style={{background:'var(--window-yellow)'}} />
                <span className={styles.dot} style={{background:'var(--window-green)'}} />
              </div>
              <div className={styles.dashboard}>
                <div className={styles.dashHeader}>
                  <span className={styles.dashTitle}>{t('hero.dashTitle')}</span>
                  <span className={styles.dashDate}>{t('hero.dashDate')}</span>
                </div>
                <div className={styles.dashStats}>
                  <div className={styles.dashStatCard}>
                    <div className={styles.dashStatNum} ref={num1Ref}>0</div>
                    <div className={styles.dashStatLabel}>{t('hero.dash1')}</div>
                  </div>
                  <div className={styles.dashStatCard}>
                    <div className={styles.dashStatNum} ref={num2Ref}>0</div>
                    <div className={styles.dashStatLabel}>{t('hero.dash2')}</div>
                  </div>
                  <div className={styles.dashStatCard}>
                    <div className={styles.dashStatNum} ref={num3Ref}>0%</div>
                    <div className={styles.dashStatLabel}>{t('hero.dash3')}</div>
                  </div>
                </div>
                <div className={styles.dashChart}>
                  <div className={styles.chartLabel}>{t('hero.chartTitle')}</div>
                  <div className={styles.chartBars}>
                    {[
                      { h: 100, opacity: 0.9,  color: 'var(--primary)' },
                      { h: 72,  opacity: 0.7,  color: 'var(--primary)' },
                      { h: 51,  opacity: 0.55, color: 'var(--primary)' },
                      { h: 35,  opacity: 0.4,  color: 'var(--primary)' },
                      { h: 20,  opacity: 0.9,  color: 'var(--success)' },
                    ].map(({ h, opacity, color }, i) => (
                      <div key={i} className={styles.chartBar} style={{ height: `${h}%`, background: color, opacity }} />
                    ))}
                  </div>
                  <div className={styles.chartLabels}>
                    {['chart1','chart2','chart3','chart4','chart5'].map(k => (
                      <span key={k}>{t(`hero.${k}`)}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.dashAiCard}>
                  <div className={styles.dashAiLabel}>{t('hero.aiRec')}</div>
                  <div className={styles.dashAiTitle}>{t('hero.aiRecText')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


