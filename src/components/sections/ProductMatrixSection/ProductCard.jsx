import styles from './ProductCard.module.css';

/**
 * ProductCard — 产品矩阵单张卡片
 * v2.1.0：icon 支持 SVG 组件（ReactElement）和 Emoji 字符串两种形式
 * iconColor: SVG currentColor 颜色
 * iconBg:    图标背景色
 */
export default function ProductCard({ icon: Icon, name, desc, iconBg, iconColor, linkText = "产品详情 →", delay = 0 }) {
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  // 兼容：字符串 Emoji 直接渲染，函数组件调用渲染
  const iconContent = typeof Icon === 'function'
    ? <Icon />
    : Icon;

  return (
    <div className={`${styles.card} reveal ${delayClass}`}>
      <div
        className={styles.icon}
        style={{
          ...(iconBg    ? { background: iconBg }    : {}),
          ...(iconColor ? { color: iconColor }       : {}),
        }}
      >
        {iconContent}
      </div>
      <div className={styles.name}>{name}</div>
      <p  className={styles.desc}>{desc}</p>
      <span className={styles.link}>{linkText}</span>
    </div>
  );
}
