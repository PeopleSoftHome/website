import { useI18n } from '../../../i18n/index';
import styles from './TestimonialCard.module.css';

/**
 * TestimonialCard — 客户证言单张卡片
 */
export default function TestimonialCard({ industry, product, text, name, title, avatarGrad, avatarChar }) {
  return (
    <div className={styles.card}>
      {/* 标签行 */}
      <div className={styles.tags}>
        <span className={styles.tagIndustry}>{industry}</span>
        <span className={styles.tagProduct}>{product}</span>
      </div>

      {/* 引号 */}
      <div className={styles.quote} aria-hidden="true">"</div>

      {/* 正文 */}
      <p className={styles.text}>{text}</p>

      {/* 作者 */}
      <div className={styles.author}>
        <div
          className={styles.avatar}
          style={{ background: avatarGrad }}
          aria-hidden="true"
        >
          {avatarChar}
        </div>
        <div>
          <div className={styles.name}>{name}</div>
          <div className={styles.title}>{title}</div>
        </div>
      </div>
    </div>
  );
}
