import { INDUSTRY_TABS }         from '../../../data/industries';
import { useTabs }               from '../../../hooks/useTabs';
import { useModalContext }       from '../../../context/ModalContext';
import { useI18n }               from '../../../i18n/index';
import { INDUSTRY_KEY_MAP }      from '../../../i18n/keyMap';
import SectionHeader             from '../../ui/SectionHeader/SectionHeader';
import TabNav                    from '../../ui/TabNav/TabNav';
import ProductScreenshot         from './ProductScreenshot';
import RevealWrapper             from '../../ui/RevealWrapper/RevealWrapper';
import styles                    from './IndustrySolutionSection.module.css';

export default function IndustrySolutionSection() {
  const { activeIndex, selectTab } = useTabs(0);
  const { openModal } = useModalContext();
  const { t }         = useI18n();
  const panel         = INDUSTRY_TABS[activeIndex];
  const indKey        = INDUSTRY_KEY_MAP[panel.id] ?? panel.id;

  // 用 i18n key 覆盖 tab label
  const translatedTabs = INDUSTRY_TABS.map(tab => ({
    ...tab,
    label: t(`industry.tabs.${INDUSTRY_KEY_MAP[tab.id] ?? tab.id}`),
  }));

  // 用 i18n 构建当前 panel 的 features（3 条）
  const features = [
    { badge: t('industry.badges.f1'), title: t(`industry.${indKey}.f1title`), desc: t(`industry.${indKey}.f1desc`) },
    { badge: t('industry.badges.f2'), title: t(`industry.${indKey}.f2title`), desc: t(`industry.${indKey}.f2desc`) },
    { badge: t('industry.badges.f3'), title: t(`industry.${indKey}.f3title`), desc: t(`industry.${indKey}.f3desc`) },
  ];

  return (
    <section className={`section ${styles.section}`} id="industry">
      <div className="container">
        <RevealWrapper>
          <SectionHeader
            tag={t('industry.sectionTag')}
            title={t('industry.sectionTitle')}
            subtitle={t('industry.sectionSub')}
          />
        </RevealWrapper>

        <RevealWrapper>
          <TabNav
            tabs={translatedTabs}
            activeIndex={activeIndex}
            onSelect={selectTab}
            variant="pill"
          />
        </RevealWrapper>

        <div className={styles.panel}>
          {/* 左侧：特色功能列表 */}
          <div className={styles.features}>
            {features.map((feat, i) => (
              <RevealWrapper key={feat.badge} delay={i}>
                <div className={styles.featureItem}>
                  <span className={styles.badge}>{feat.badge}</span>
                  <div className={styles.featureBody}>
                    <strong>{feat.title}</strong>
                    <p>{feat.desc}</p>
                  </div>
                </div>
              </RevealWrapper>
            ))}
            <RevealWrapper delay={3}>
              <button className={styles.cta} onClick={openModal}>
                {t('industry.getCta')}
              </button>
            </RevealWrapper>
          </div>

          {/* 右侧：产品截图卡 */}
          <RevealWrapper delay={2} className={styles.screenshotWrap}>
            <ProductScreenshot screenshot={panel.screenshot} indKey={indKey} />
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
