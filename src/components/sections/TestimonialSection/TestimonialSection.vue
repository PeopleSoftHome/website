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
            v-for="item in TESTIMONIALS"
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
          :aria-label="`第 ${i + 1} 条`"
        />
        <button :class="s.navBtn" @click="goTo(currentIdx + 1); startAutoPlay()" :aria-label="t('testimonials.nextBtn')">
          <Icon name="chevron-right" :size="20" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { TESTIMONIALS } from '@/data/testimonials.js';
import { useCarousel } from '@/composables/useCarousel.js';
import Icon from '../../ui/Icon/Icon.vue';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import TestimonialCard from './TestimonialCard.vue';
import s from './TestimonialSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const itemCount = TESTIMONIALS.length;
const {
  currentIdx,
  goTo,
  trackRef,
  startAutoPlay,
  stopAutoPlay,
  bindPauseEvents,
  getColCount,
  getOffset,
} = useCarousel(itemCount, { autoPlayInterval: 4500 });

const wrapRef = ref(null);

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
