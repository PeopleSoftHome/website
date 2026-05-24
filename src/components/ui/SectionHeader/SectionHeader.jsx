import Tag from '../Tag/Tag';
import styles from './SectionHeader.module.css';

/**
 * SectionHeader — 通用区块标题组（Tag + H2 + Subtitle）
 * @param {'light'|'dark'} variant  - light=浅色区块, dark=深色区块
 */
export default function SectionHeader({
  tag,
  title,
  subtitle,
  variant   = 'light',
  className = '',
}) {
  const tagVariant = variant === 'dark' ? 'ai' : 'light';

  return (
    <div className={[styles.header, styles[variant], className].filter(Boolean).join(' ')}>
      {tag && <Tag variant={tagVariant}>{tag}</Tag>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
