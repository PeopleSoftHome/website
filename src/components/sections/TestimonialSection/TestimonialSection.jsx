import { useEffect, useRef } from 'react';
import { TESTIMONIALS } from '../../../data/testimonials';
import { useCarousel } from '../../../hooks/useCarousel';
import SectionHeader from '../../ui/SectionHeader/SectionHeader';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper';
import TestimonialCard from './TestimonialCard';
import { useI18n } from '../../../i18n/index';
import styles from './TestimonialSection.module.css';

/**
 * TestimonialSection — SEC-08
 * 4 条客户证言，3列自动轮播
 * ✅ BUG-02 修复：resize 后位置正确（useCarousel Hook）
 * ✅ BUG-03 修复：悬停暂停自动播放（bindPauseEvents）
 */
export default function TestimonialSection() {
  const { t }     = useI18n();
  const itemCount = TESTIMONIALS.length;
  const {
    currentIdx,
    goTo,
    trackRef,
    startAutoPlay,
    bindPauseEvents,
    getColCount,
    getOffset,
  } = useCarousel(itemCount, { autoPlayInterval: 4500 });

  // 悬停暂停绑定（BUG-03）
  const wrapRef = useRef(null);
  useEffect(() => {
    return bindPauseEvents(wrapRef.current);
  }, [bindPauseEvents]);

  // 计算单卡宽度，用于 flex-basis
  const getCardWidth = () => {
    if (!trackRef.current) return '33.333%';
    const cols  = getColCount();
    const gap   = 20;
    const totalW = trackRef.current.parentElement?.offsetWidth ?? 900;
    return Math.floor((totalW - gap * (cols - 1)) / cols) + 'px';
  };

  return (
    <section className={`section ${styles.section}`} id="testimonials">
      <div className="container">
        <RevealWrapper>
          <SectionHeader
            tag={t("testimonials.sectionTag")}
            title={t("testimonials.sectionTitle")}
          />
        </RevealWrapper>

        {/* 轮播容器 */}
        <div className={styles.carouselWrap} ref={wrapRef}>
          {/* Track */}
          <div
            className={styles.track}
            ref={trackRef}
            style={{ transform: `translateX(-${getOffset()}px)` }}
          >
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className={styles.cardWrap}
                style={{ flex: `0 0 ${getCardWidth()}`, marginRight: '20px' }}
              >
                <TestimonialCard {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* 导航：上一页 / 圆点 / 下一页 */}
        <div className={styles.nav}>
          <button
            className={styles.navBtn}
            onClick={() => { goTo(currentIdx - 1); startAutoPlay(); }}
            aria-label={t("testimonials.prevBtn")}
          >
            ‹
          </button>

          {Array.from({ length: itemCount }).map((_, i) => (
            <button
              key={i}
              className={[styles.dot, i === currentIdx ? styles.dotActive : ''].join(' ')}
              onClick={() => { goTo(i); startAutoPlay(); }}
              aria-label={`第 ${i + 1} 条`}
            />
          ))}

          <button
            className={styles.navBtn}
            onClick={() => { goTo(currentIdx + 1); startAutoPlay(); }}
            aria-label={t("testimonials.nextBtn")}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
