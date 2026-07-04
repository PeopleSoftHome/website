<template>
  <section :class="s.section" id="testimonials">
    <div class="container">
      <RevealWrapper>
        <SectionHeader
          :tag="t('testimonials.sectionTag')"
          :title="t('testimonials.sectionTitle')"
        />
      </RevealWrapper>
      <div ref="wrapRef" :class="s.carouselWrap">
        <div
          ref="trackRef"
          :class="s.track"
          :style="{ transform: `translateX(-${getOffset()}px)` }"
        >
          <div
            v-for="item in displayItems"
            :key="item.id"
            :class="s.cardWrap"
            :style="{ flex: `0 0 ${cardWidth}`, marginRight: '20px' }"
          >
            <TestimonialCard v-bind="item" />
          </div>
        </div>
      </div>
      <div :class="s.nav">
        <button :class="s.navBtn" @click="goTo(currentIdx - 1); startAutoPlay()" :aria-label="t('testimonials.prevBtn')">
          <Icon name="chevron-left" :size="20" />
        </button>
        <button
          v-for="(_, i) in itemCount"
          :key="i"
          :class="[s.dot, i === currentIdx ? s.dotActive : '']"
          @click="goTo(i); startAutoPlay()"
          :aria-label="t('testimonials.dotLabel', { n: i + 1 })"
        />
        <button :class="s.navBtn" @click="goTo(currentIdx + 1); startAutoPlay()" :aria-label="t('testimonials.nextBtn')">
          <Icon name="chevron-right" :size="20" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, inject, type Ref } from 'vue';

import { useCarousel } from '@/composables/useCarousel';
import { useCmsDataByKey } from '@/composables/useCmsData';
import { transformTestimonials } from '@/api/transforms';
import { getTestimonials } from '@/data/testimonials';

import Icon from '../../ui/Icon/Icon.vue';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import TestimonialCard from './TestimonialCard.vue';
import s from './TestimonialSection.module.css';

interface TestimonialItem {
  id: string;
  industry: string;
  product: string;
  text: string;
  name: string;
  title: string;
  avatar: string;
  avatarGrad: string;
  avatarChar: string;
  isActive?: boolean;
}

const { t, locale } = useI18n();

const fallbackTestimonials = computed(() => getTestimonials(locale.value));

const GRAD_PRESETS = [
  'linear-gradient(135deg, #1B5FEB, #7C3AED)',
  'linear-gradient(135deg, #059669, #1B5FEB)',
  'linear-gradient(135deg, #D97706, #EF4444)',
  'linear-gradient(135deg, #7C3AED, #EC4899)',
  'linear-gradient(135deg, #0284C7, #1B5FEB)',
];

const { displayItems: rawDisplayItems, isLoading: loading } = useCmsDataByKey('testimonials', {
  transform: transformTestimonials,
});
const displayItems = computed(() => {
  const cms = rawDisplayItems.value as unknown as TestimonialItem[];
  return cms.length ? cms : (fallbackTestimonials.value as unknown as TestimonialItem[]);
});

const itemCount = computed(() => displayItems.value.length);

const {
  currentIdx,
  goTo,
  trackRef,
  startAutoPlay,
  bindPauseEvents,
  getColCount,
  getOffset,
} = useCarousel(itemCount.value, { autoPlayInterval: 4500 });

const wrapRef: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  if (wrapRef.value) {
    const cleanup = bindPauseEvents(wrapRef.value);
    onUnmounted(() => cleanup?.());
  }
});

const cardWidth = computed(() => {
  if (!trackRef.value) return '33.333%';
  const cols = getColCount();
  const gap = 20;
  const totalW = trackRef.value.parentElement?.offsetWidth ?? 900;
  return Math.floor((totalW - gap * (cols - 1)) / cols) + 'px';
});
</script>
