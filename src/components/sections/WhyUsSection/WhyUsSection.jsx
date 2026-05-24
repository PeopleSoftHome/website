import { useTabs }          from '../../../hooks/useTabs';
import { useCountUp }       from '../../../hooks/useCountUp';
import { useI18n }          from '../../../i18n/index';
import { STATS_BAR }        from '../../../data/whyUs';
import { SECURITY_CERTS }   from '../../../data/security';
import TabNav               from '../../ui/TabNav/TabNav';
import MetricCard           from './MetricCard';
import RevealWrapper        from '../../ui/RevealWrapper/RevealWrapper';
import styles               from './WhyUsSection.module.css';

const TAB_KEYS = ['product', 'brand', 'success'];

export default function WhyUsSection() {
  const { activeIndex, selectTab } = useTabs(0);
  const { t } = useI18n();

  const tabs = TAB_KEYS.map(k => ({ id: k, label: t(`whyUs.tabs.${k}`) }));
  const metrics = t(`whyUs.metrics.${TAB_KEYS[activeIndex]}`);

  return (
    <section className={styles.section} id="whyus">
      <div className="container">
        <RevealWrapper className={styles.header}>
          <h2 className={styles.title}>{t('whyUs.sectionTitle')}</h2>
          <p  className={styles.subtitle}>{t('whyUs.sectionSub')}</p>
        </RevealWrapper>

        <RevealWrapper>
          <TabNav tabs={tabs} activeIndex={activeIndex} onSelect={selectTab} variant="underline" />
        </RevealWrapper>

        <div className={styles.grid} key={TAB_KEYS[activeIndex]}>
          {Array.isArray(metrics) && metrics.map((m, i) => (
            <MetricCard key={m.label} num={m.num} label={m.label} desc={m.desc} delay={i} />
          ))}
        </div>

        {/* 底部统计数字条 */}
        <RevealWrapper className={styles.statsBar}>
          {STATS_BAR.map((item, i) => {
            const label = t(`whyUs.statsBar.${i}.label`);
            return (
              <StatsBarItem
                key={i}
                target={item.target}
                suffix={item.suffix}
                label={label}
                isLast={i === STATS_BAR.length - 1}
              />
            );
          })}
        </RevealWrapper>

        {/* 安全认证徽章区 */}
        <RevealWrapper className={styles.certSection}>
          <div className={styles.certTitle}>{t('whyUs.security.title')}</div>
          <div className={styles.certList}>
            {SECURITY_CERTS.map((cert, i) => {
              const certData = t(`whyUs.security.certs.${i}`);
              return (
                <div key={cert.id} className={styles.certBadge}>
                  <span style={{ fontSize: 16 }}>{cert.icon}</span>
                  <span className={styles.certLabel}>
                    {typeof certData === 'object' ? certData.label : cert.label}
                  </span>
                  <span className={styles.certDesc}>
                    {typeof certData === 'object' ? certData.desc  : cert.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}

function StatsBarItem({ target, suffix, label, isLast }) {
  const { ref } = useCountUp(target, { suffix, duration: 1800 });
  return (
    <div className={[styles.statItem, isLast ? styles.statLast : ''].join(' ')}>
      <div className={styles.statNum}>
        <span ref={ref}>0</span>
        <span className={styles.statSuffix}>{suffix}</span>
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
