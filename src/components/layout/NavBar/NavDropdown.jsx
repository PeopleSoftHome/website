import styles from './NavDropdown.module.css';

/**
 * NavDropdown — Mega 下拉菜单
 * 结构：2列网格 × 4个菜单项 + 底部推广 Banner
 */
export default function NavDropdown({ items = [], banner }) {
  return (
    <div className={styles.dropdown}>
      {/* 菜单项网格 */}
      <div className={styles.grid}>
        {items.map((item) => (
          <a key={item.title} href={item.href} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>
              <strong className={styles.itemTitle}>{item.title}</strong>
              <span className={styles.itemDesc}>{item.desc}</span>
            </span>
          </a>
        ))}
      </div>

      {/* 底部推广 Banner */}
      {banner && (
        <>
          <div className={styles.divider} />
          <a href={banner.href} className={styles.banner}>
            <span className={styles.bannerThumb}>{banner.thumb}</span>
            <span className={styles.bannerBody}>
              <strong className={styles.bannerTitle}>{banner.title}</strong>
              <span className={styles.bannerDesc}>{banner.desc}</span>
            </span>
            <span className={styles.bannerArrow}>→</span>
          </a>
        </>
      )}
    </div>
  );
}
