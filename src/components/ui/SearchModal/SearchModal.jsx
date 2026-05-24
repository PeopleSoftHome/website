import { useEffect } from 'react';
import { useSearchContext }   from '../../../context/SearchContext';
import { useSearch }          from '../../../hooks/useSearch';
import { useI18n }            from '../../../i18n/index';
import { HOT_SEARCHES }       from '../../../data/searchIndex';
import BaseModal              from '../BaseModal/BaseModal';
import styles                 from './SearchModal.module.css';

/**
 * SearchModal — 全局搜索弹窗（Sprint 12 / v2.3.0）
 *
 * 触发方式：
 *  - Cmd+K / Ctrl+K（全局快捷键，在 SearchContext 中监听）
 *  - NavBar 搜索图标点击
 *
 * z-index: 2500（DemoModal 2000 < SearchModal < VideoModal 3000）
 */
export default function SearchModal() {
  const { isOpen, closeSearch }  = useSearchContext();
  const { t }                    = useI18n();

  const {
    query, handleQueryChange,
    groupedResults, flatResults, focusIdx,
    totalResults, highlight,
    selectItem, handleKeyDown,
    inputRef, focusInput,
    TYPE_LABELS,
  } = useSearch(closeSearch);

  /* 打开时自动聚焦 */
  useEffect(() => {
    if (isOpen) focusInput();
  }, [isOpen, focusInput]);

  const hasResults = totalResults > 0;
  const hasQuery   = query.trim().length > 0;

  /* 展平列表索引（用于 focusIdx 对照 data-idx）*/
  let flatIdx = 0;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeSearch}
      ariaLabel={t('search.label')}
      overlayClassName={styles.overlay}
    >
      <div className={styles.modal}>

        {/* ── 搜索输入框 ── */}
        <div className={styles.inputRow}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <div className={styles.inputRight}>
            <span className={styles.shortcut} aria-hidden="true">{t('search.shortcut')}</span>
            <button className={styles.escBtn} onClick={closeSearch} aria-label={t('modal.close')}>ESC</button>
          </div>
        </div>

        {/* ── 内容区 ── */}
        <div className={styles.body}>

          {/* 无输入时：热门搜索 */}
          {!hasQuery && (
            <div className={styles.hotSection}>
              <div className={styles.hotTitle}>{t('search.hot')}</div>
              <div className={styles.hotTags}>
                {HOT_SEARCHES.map((term) => (
                  <button
                    key={term}
                    className={styles.hotTag}
                    onClick={() => handleQueryChange(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 有输入 + 有结果：分类展示 */}
          {hasQuery && hasResults && (
            <div className={styles.results}>
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className={styles.group}>
                  {/* 分组标题 */}
                  <div className={styles.groupHeader}>
                    <span className={styles.groupLabel}>{TYPE_LABELS[type] ?? type}</span>
                    <span className={styles.groupCount}>{items.length}</span>
                  </div>

                  {/* 结果列表 */}
                  {items.map((item) => {
                    const idx    = flatIdx++;
                    const active = idx === focusIdx;
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        className={[styles.resultItem, active ? styles.resultActive : ''].join(' ')}
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => {}}
                      >
                        <span className={styles.resultIcon} aria-hidden="true">{item.icon}</span>
                        <span className={styles.resultBody}>
                          <span
                            className={styles.resultTitle}
                            dangerouslySetInnerHTML={{
                              __html: highlight(item.title, query),
                            }}
                          />
                          <span
                            className={styles.resultDesc}
                            dangerouslySetInnerHTML={{
                              __html: highlight(item.desc, query),
                            }}
                          />
                        </span>
                        <span className={styles.resultArrow} aria-hidden="true">→</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* 有输入 + 无结果 */}
          {hasQuery && !hasResults && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔭</div>
              <div className={styles.emptyTitle}>
                {t('search.noResult', { query })}
              </div>
              <div className={styles.emptySub}>{t('search.noResultSub')}</div>
              <div className={styles.hotTags} style={{ justifyContent: 'center', marginTop: 16 }}>
                {HOT_SEARCHES.slice(0, 4).map((term) => (
                  <button key={term} className={styles.hotTag} onClick={() => handleQueryChange(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 底部快捷键提示 ── */}
        {hasResults && (
          <div className={styles.footer}>
            <span>{t('search.navUp')}</span>
            <span>{t('search.navEnter')}</span>
            <span>{t('search.navEsc')}</span>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
