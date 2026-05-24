import { RESOURCE_TYPE_STYLES } from '../../../data/resources';
import styles from './ResourceCard.module.css';

/**
 * ResourceCard — 资源中心单张卡片
 */
export default function ResourceCard({ type, typeLabel, icon, imgGrad, title, desc, date, cta, delay = 0 }) {
  const typeStyle = RESOURCE_TYPE_STYLES[type] ?? RESOURCE_TYPE_STYLES.article;
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div className={`${styles.card} reveal ${delayClass}`}>
      {/* 封面区 */}
      <div className={styles.cover} style={{ background: imgGrad }}>
        <div className={styles.coverIcon}>{icon}</div>
        <span
          className={styles.typeTag}
          style={{ background: typeStyle.bg, color: typeStyle.color }}
        >
          {typeLabel}
        </span>
      </div>

      {/* 内容区 */}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p  className={styles.desc}>{desc}</p>
        <div className={styles.footer}>
          <span className={styles.date}>{date}</span>
          <span className={styles.cta}>{cta}</span>
        </div>
      </div>
    </div>
  );
}
