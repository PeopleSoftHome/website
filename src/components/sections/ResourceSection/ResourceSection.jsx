import { RESOURCES } from '../../../data/resources';
import SectionHeader from '../../ui/SectionHeader/SectionHeader';
import ResourceCard from './ResourceCard';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper';
import { useI18n } from '../../../i18n/index';
import styles from './ResourceSection.module.css';

/**
 * ResourceSection — SEC-11
 * 3 张资源卡片（v2.1.0 扩展至 6 张）
 */
export default function ResourceSection() {
  const { t } = useI18n();
  return (
    <section className={`section ${styles.section}`} id="resources">
      <div className="container">
        <RevealWrapper>
          <SectionHeader
            tag={t("resources.sectionTag")}
            title={t("resources.sectionTitle")}
          />
        </RevealWrapper>

        <div className={styles.grid}>
          {RESOURCES.map((res, i) => (
            <ResourceCard key={res.id} {...res} delay={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
