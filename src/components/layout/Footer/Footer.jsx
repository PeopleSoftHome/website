import { FOOTER_LINKS, HOT_TAGS } from '../../../data/navigation';
import { useI18n } from '../../../i18n/index';
import QrPlaceholder from '../../icons/QrPlaceholder';
import ZhihuIcon from '../../icons/ZhihuIcon';
import WeiboIcon from '../../icons/WeiboIcon';
import styles from './Footer.module.css';

/**
 * Footer — 4列布局页脚
 * 品牌信息列 + 产品/资源/关于 三个链接列
 * v2.3.3 Phase 3：内联 SVG 提取为独立图标组件
 */
export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* 4列主体 */}
        <div className={styles.top}>
          {/* 品牌信息列 */}
          <div className={styles.brand}>
            <div className={styles.logo}>TalentPro</div>
            <p className={styles.desc}>
              {t('footer.desc')}
            </p>
            <div className={styles.contact}>
              <strong>{t('footer.preSale')}</strong>
              <strong>{t('footer.afterSale')}</strong>
            </div>

            {/* ── 二维码区域 ── */}
            <div className={styles.qrSection}>
              <div className={styles.qrItem}>
                <QrPlaceholder />
                <span>{t('footer.qr1')}</span>
              </div>
              <div className={styles.qrItem}>
                <QrPlaceholder />
                <span>{t('footer.qr2')}</span>
              </div>
            </div>

            {/* ── 社交图标行 ── */}
            <div className={styles.socialRow}>
              <a href="#" className={styles.socialIcon} aria-label="知乎">
                <ZhihuIcon />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="微博">
                <WeiboIcon />
              </a>
            </div>

            {/* 热门推荐 Tags */}
            <div className={styles.hotSection}>
              <div className={styles.hotTitle}>{t('footer.hotTitle')}</div>
              <div className={styles.hotTags}>
                {HOT_TAGS.map((tag) => (
                  <a key={tag} href="#" className={styles.hotTag}>{tag}</a>
                ))}
              </div>
            </div>
          </div>

          {/* 链接列 */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <div className={styles.colTitle}>{col.title}</div>
              <ul className={styles.links}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部版权行 */}
        <div className={styles.bottom}>
          <span>{t('footer.copyright')}</span>
          <div className={styles.bottomLinks}>
            <a href="#">{t('footer.icp')}</a>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.sitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
