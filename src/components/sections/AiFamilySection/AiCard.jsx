import styles from './AiCard.module.css';

/**
 * AiCard — AI Family 专区玻璃态卡片
 * @param {boolean} hot - 是否显示 HOT 🔥 徽章
 */
export default function AiCard({ icon: Icon, name, tagline, hot = false, hotLabel = "HOT 🔥", linkText = "产品详情 →", delay = 0 }) {
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';
  const iconContent = typeof Icon === 'function' ? <Icon /> : Icon;

  return (
    <div className={`${styles.card} reveal ${delayClass}`}>
      {hot && <span className={styles.badge}>{hotLabel}</span>}
      {/* AI 专区图标：紫色，稍大显示 */}
      <div className={styles.icon} style={{ color: 'var(--ai-purple-light)' }}>{iconContent}</div>
      <div className={styles.name}>{name}</div>
      <p  className={styles.tagline}>{tagline}</p>
      <span className={styles.link}>{linkText}</span>
    </div>
  );
}
