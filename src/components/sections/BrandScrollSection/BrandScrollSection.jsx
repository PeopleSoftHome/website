import { BRAND_LOGOS } from '../../../data/stats';
import { useI18n }    from '../../../i18n/index';
import styles         from './BrandScrollSection.module.css';

/**
 * BrandScrollSection — SEC-03
 * 品牌 Logo 无限水平滚动（CSS Marquee），hover 暂停
 * v2.3.0：label 文字国际化
 */
export default function BrandScrollSection() {
  const { t } = useI18n();
  const logos = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div className={styles.section}>
      <p className={styles.label}>{t('marquee.label')}</p>
      <div className={styles.wrapper}>
        <div className={styles.track}>
          {logos.map((name, i) => (
            <span key={i} className={styles.logo}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
