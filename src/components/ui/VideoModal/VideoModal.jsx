import { useRef, useCallback } from 'react';
import { useVideoModalContext } from '../../../context/VideoModalContext';
import { useI18n } from '../../../i18n/index';
import BaseModal from '../BaseModal/BaseModal';
import styles from './VideoModal.module.css';

/**
 * VideoModal — 产品演示视频弹窗（SEC-14 OPT-06）
 * 触发：HeroSection「▶ 观看产品演示」按钮
 * 特性：
 *   - 黑色背景遮罩（z-index: 3000，高于 DemoModal 的 2000）
 *   - 16:9 比例 iframe 容器，圆角 + 深色阴影
 *   - 关闭时重置 iframe src，强制停止视频/音频
 *   - 支持：点击遮罩 / ✕ 按钮 / ESC 关闭（BaseModal 统一管理）
 */

// 演示视频 URL（上线时替换为真实产品演示）
const VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1';

export default function VideoModal() {
  const { isOpen, closeVideo } = useVideoModalContext();
  const { t } = useI18n();
  const iframeRef = useRef(null);

  // 关闭时先清空 iframe src，强制停止播放，再关闭弹窗
  const handleClose = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
    // 短暂延迟，确保 src 清空生效后再隐藏弹窗
    setTimeout(closeVideo, 50);
  }, [closeVideo]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel={t('video.title')}
      overlayClassName={styles.overlay}
    >
      <div className={styles.modal}>
        {/* 关闭按钮 */}
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label={t('video.close')}
        >
          ✕
        </button>

        {/* 16:9 视频容器 */}
        <div className={styles.videoWrap}>
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            src={`${VIDEO_URL}&autoplay=1`}
            title={t('video.title')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </BaseModal>
  );
}
