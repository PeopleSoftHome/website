<template>
  <HeroSection />
  <Suspense>
    <template #fallback><SectionSkeleton :height="260" /></template>
    <BrandScrollSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="360" /></template>
    <StatsSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="720" /></template>
    <ProductMatrixSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="680" /></template>
    <AiFamilySection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="640" /></template>
    <IndustrySolutionSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="520" /></template>
    <TestimonialSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="580" /></template>
    <LogoWallSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="760" /></template>
    <WhyUsSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="620" /></template>
    <ResourceSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="720" /></template>
    <RoiCalculatorSection />
  </Suspense>
  <Suspense>
    <template #fallback><SectionSkeleton :height="440" /></template>
    <CtaBannerSection />
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import HeroSection from '@/components/sections/HeroSection/HeroSection.vue';
import SectionSkeleton from '@/components/ui/SectionSkeleton/SectionSkeleton.vue';

const BrandScrollSection      = defineAsyncComponent(() => import('@/components/sections/BrandScrollSection/BrandScrollSection.vue'));
const StatsSection            = defineAsyncComponent(() => import('@/components/sections/StatsSection/StatsSection.vue'));
const ProductMatrixSection    = defineAsyncComponent(() => import('@/components/sections/ProductMatrixSection/ProductMatrixSection.vue'));
const AiFamilySection         = defineAsyncComponent(() => import('@/components/sections/AiFamilySection/AiFamilySection.vue'));
const IndustrySolutionSection = defineAsyncComponent(() => import('@/components/sections/IndustrySolutionSection/IndustrySolutionSection.vue'));
const TestimonialSection      = defineAsyncComponent(() => import('@/components/sections/TestimonialSection/TestimonialSection.vue'));
const LogoWallSection         = defineAsyncComponent(() => import('@/components/sections/LogoWallSection/LogoWallSection.vue'));
const WhyUsSection            = defineAsyncComponent(() => import('@/components/sections/WhyUsSection/WhyUsSection.vue'));
const ResourceSection         = defineAsyncComponent(() => import('@/components/sections/ResourceSection/ResourceSection.vue'));
const RoiCalculatorSection    = defineAsyncComponent(() => import('@/components/sections/RoiCalculatorSection/RoiCalculatorSection.vue'));
const CtaBannerSection        = defineAsyncComponent(() => import('@/components/sections/CtaBannerSection/CtaBannerSection.vue'));
</script>

