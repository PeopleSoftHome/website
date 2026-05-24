import { lazy, Suspense } from 'react';
import HeroSection from '../components/sections/HeroSection/HeroSection';
import styles from './HomePage.module.css';

/* ── 首屏下方 Section 懒加载（降低 TTI）── */
const BrandScrollSection      = lazy(() => import('../components/sections/BrandScrollSection/BrandScrollSection'));
const StatsSection            = lazy(() => import('../components/sections/StatsSection/StatsSection'));
const ProductMatrixSection    = lazy(() => import('../components/sections/ProductMatrixSection/ProductMatrixSection'));
const AiFamilySection         = lazy(() => import('../components/sections/AiFamilySection/AiFamilySection'));
const IndustrySolutionSection = lazy(() => import('../components/sections/IndustrySolutionSection/IndustrySolutionSection'));
const TestimonialSection      = lazy(() => import('../components/sections/TestimonialSection/TestimonialSection'));
const LogoWallSection         = lazy(() => import('../components/sections/LogoWallSection/LogoWallSection'));
const WhyUsSection            = lazy(() => import('../components/sections/WhyUsSection/WhyUsSection'));
const ResourceSection         = lazy(() => import('../components/sections/ResourceSection/ResourceSection'));
const CtaBannerSection        = lazy(() => import('../components/sections/CtaBannerSection/CtaBannerSection'));

/**
 * HomePage — 首页页面容器（v2.3.4 Phase 4）
 *
 * 代码分割策略：
 *   - HeroSection 同步加载（LCP 关键路径）
 *   - 其余 Section 懒加载（进入视口前由 Suspense 兜底）
 */
export default function HomePage() {
  return (
    <>
      {/* ── SEC-02 ✅ Hero（首屏关键路径，同步加载）── */}
      <HeroSection />

      {/* ── 首屏下方 Section（独立懒加载 + 高度占位防 CLS）── */}
      <Suspense fallback={<SectionSkeleton h={260} />}>
        <BrandScrollSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={360} />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={720} />}>
        <ProductMatrixSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={680} />}>
        <AiFamilySection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={640} />}>
        <IndustrySolutionSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={520} />}>
        <TestimonialSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={580} />}>
        <LogoWallSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={760} />}>
        <WhyUsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={620} />}>
        <ResourceSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton h={440} />}>
        <CtaBannerSection />
      </Suspense>
    </>
  );
}

/** 懒加载 Section 的轻量占位骨架（避免 layout shift）
 *  每个 Section 独立 Suspense，高度按真实内容估算，彻底消除 CLS */
function SectionSkeleton({ h = 400 }) {
  return <div className={styles.lazyPlaceholder} style={{ minHeight: h }} aria-hidden="true" />;
}
