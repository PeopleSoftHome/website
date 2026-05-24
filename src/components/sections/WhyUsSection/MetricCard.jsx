import styles from './MetricCard.module.css';

/**
 * MetricCard — 「为什么选我们」指标卡片（深色背景）
 */
export default function MetricCard({ num, label, desc, delay = 0 }) {
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div className={`${styles.card} reveal ${delayClass}`}>
      <div className={styles.num}>{num}</div>
      <div className={styles.label}>{label}</div>
      <p  className={styles.desc}>{desc}</p>
    </div>
  );
}
