import { useState, useCallback } from 'react';
import { LOGO_ITEMS, LOGO_FILTERS } from '../../../data/logos';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper';
import { useI18n } from '../../../i18n/index';
import styles from './LogoWallSection.module.css';

/**
 * LogoWallSection — SEC-09
 * v2.2.0：品牌色首字母圆形（OPT-03）+ 行业筛选保留
 */
export default function LogoWallSection() {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilter = useCallback((id) => {
    setActiveFilter(id);
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        {/* 标题 */}
        <RevealWrapper>
          <h2 className={styles.title}>
            {t('logoWall.title')}
          </h2>
        </RevealWrapper>

        {/* 筛选按钮 */}
        <RevealWrapper>
          <div className={styles.filters} role="group" aria-label={t("logoWall.filterLabel")}>
            {LOGO_FILTERS.map((f) => (
              <button
                key={f.id}
                className={[
                  styles.filterBtn,
                  activeFilter === f.id ? styles.filterActive : '',
                ].join(' ')}
                onClick={() => handleFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </RevealWrapper>

        {/* Logo 网格 */}
        <RevealWrapper>
          <div className={styles.grid}>
            {LOGO_ITEMS.map((item) => {
              const hidden = activeFilter !== 'all' && item.industry !== activeFilter;
              return (
                <div
                  key={item.id}
                  className={[styles.item, hidden ? styles.hidden : ''].join(' ')}
                  aria-hidden={hidden}
                >
                  {/* v2.2.0：品牌色首字母圆形 */}
                  <div className={styles.itemInner}>
                    <div
                      className={styles.logoCircle}
                      style={{ '--brand': item.brandColor }}
                    >
                      <span className={styles.logoInitial}>{item.initial}</span>
                    </div>
                    <span className={styles.name}>{item.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
