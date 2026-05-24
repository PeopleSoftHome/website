import styles from './TabNav.module.css';

/**
 * TabNav — 通用 Tab 导航
 * @param {'pill'|'segment'} variant
 *   segment = 灰色背景圆角胶囊容器（产品矩阵样式）
 *   pill    = 白底描边独立胶囊（行业方案 / WhyUs 样式）
 * @param {Array<{id, label}>} tabs
 * @param {number} activeIndex
 * @param {function} onSelect
 */
export default function TabNav({
  tabs        = [],
  activeIndex = 0,
  onSelect,
  variant     = 'segment',
  className   = '',
}) {
  return (
    <div
      className={[
        styles.nav,
        styles[variant],
        className,
      ].filter(Boolean).join(' ')}
      role="tablist"
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={i === activeIndex}
          className={[
            styles.btn,
            i === activeIndex ? styles.active : '',
          ].join(' ')}
          onClick={() => onSelect?.(i)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
