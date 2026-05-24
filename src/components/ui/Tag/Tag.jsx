import styles from './Tag.module.css';

/**
 * Tag — Section 前置胶囊标签
 * @param {'light'|'dark'|'ai'} variant
 */
export default function Tag({ children, variant = 'light', className = '' }) {
  const cls = [styles.tag, styles[variant], className].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
