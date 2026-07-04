<template>
  <section :class="s.hero" id="home" :aria-label="displayTitle || t('hero.jsonLdName')">
    <div v-if="backgroundImage" :class="s.bgImageWrap" aria-hidden="true">
      <img :src="backgroundImage" :class="s.bgImage" alt="" />
      <div :class="s.bgImageOverlay" />
    </div>
    <div :class="s.bgGlow" aria-hidden="true" />
    <div :class="s.bgGlowAi" aria-hidden="true" />
    <div :class="[s.deco, s.decoA]" aria-hidden="true" />
    <div :class="[s.deco, s.decoB]" aria-hidden="true" />
    <div :class="[s.deco, s.decoC]" aria-hidden="true" />

    <div class="container">
      <div :class="s.inner">
        <div :class="s.content">
          <div :class="s.tag">
            <span :class="s.tagDot" aria-hidden="true" />
            {{ t('hero.badge') }}
          </div>
          <h1 :class="s.title">
            <template v-if="displayTitle">{{ displayTitle }}</template>
            <template v-else>{{ t('hero.title1') }}<span :class="s.highlight">{{ t('hero.titleAI') }}</span>{{ t('hero.title2') }}<br />{{ t('hero.titleLine2') }}</template>
          </h1>
          <p :class="s.subtitle">{{ displaySubtitle }}</p>
          <div :class="s.ctas">
            <button :class="s.ctaPrimary" @click="modalStore.openModal()">{{ displayCtaPrimary }}</button>
            <button :class="s.ctaGhost" @click="videoModalStore.openVideo()">{{ displayCtaSecondary }}</button>
          </div>
          <div :class="s.trust">
            <span v-for="k in ['trust1','trust2','trust3','trust4']" :key="k" :class="s.trustItem">
              {{ t(`hero.${k}`) }}
            </span>
          </div>
        </div>

        <div v-if="showDashboard" :class="s.visual" aria-hidden="true">
          <div :class="s.deviceFrame">
            <div :class="s.deviceBar">
              <span :class="s.dot" style="background:var(--window-red)" />
              <span :class="s.dot" style="background:var(--window-yellow)" />
              <span :class="s.dot" style="background:var(--window-green)" />
            </div>
            <div :class="s.dashboard">
              <div :class="s.dashHeader">
                <span :class="s.dashTitle">{{ t('hero.dashTitle') }}</span>
                <span :class="s.dashDate">{{ t('hero.dashDate') }}</span>
              </div>
              <div :class="s.dashStats">
                <div v-for="(stat, i) in dashStats" :key="i" :class="s.dashStatCard">
                  <div :ref="el => { if(el) numRefs[i] = el as Element | null }" :class="s.dashStatNum">{{ i === 2 ? '0%' : '0' }}</div>
                  <div :class="s.dashStatLabel">{{ t(`hero.dash${i + 1}`) }}</div>
                </div>
              </div>
              <div :class="s.dashChart">
                <div :class="s.chartLabel">{{ t('hero.chartTitle') }}</div>
                <div :class="s.chartBars">
                  <div
                    v-for="(bar, i) in chartBars"
                    :key="i"
                    :class="s.chartBar"
                    :style="{ height: `${bar.h}%`, background: bar.color, opacity: bar.opacity }"
                  />
                </div>
                <div :class="s.chartLabels">
                  <span v-for="k in ['chart1','chart2','chart3','chart4','chart5']" :key="k">
                    {{ t(`hero.${k}`) }}
                  </span>
                </div>
              </div>
              <div :class="s.dashAiCard">
                <div :class="s.dashAiLabel">{{ t('hero.aiRec') }}</div>
                <div :class="s.dashAiTitle">{{ t('hero.aiRecText') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import { useVideoModalStore } from '@/stores/videoModal.pinia';
import s from './HeroSection.module.css';

interface Props {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  showDashboard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDashboard: true,
});

const { t } = useI18n();
const modalStore = useModalStore();
const videoModalStore = useVideoModalStore();

const displayTitle = computed(() => props.title?.trim() || '');
const displaySubtitle = computed(() => props.subtitle || t('hero.subtitle'));
const displayCtaPrimary = computed(() => props.ctaPrimary || t('hero.cta1'));
const displayCtaSecondary = computed(() => props.ctaSecondary || t('hero.cta2'));

const numRefs: (Element | null)[] = [];
const dashStats = [
  { target: 47, suffix: '' },
  { target: 23, suffix: '' },
  { target: 87, suffix: '%' },
];

const chartBars = [
  { h: 100, opacity: 0.9,  color: 'var(--primary)' },
  { h: 72,  opacity: 0.7,  color: 'var(--primary)' },
  { h: 51,  opacity: 0.55, color: 'var(--primary)' },
  { h: 35,  opacity: 0.4,  color: 'var(--primary)' },
  { h: 20,  opacity: 0.9,  color: 'var(--success)' },
];

onMounted(() => {
  const rafIds: number[] = [];

  const animateNum = (el: Element | null, target: number, sfx = '') => {
    if (!el) return;
    let cur = 0;
    const step = () => {
      cur = Math.min(cur + Math.ceil(target / 30), target);
      el.textContent = cur + sfx;
      if (cur < target) {
        const id = requestAnimationFrame(step);
        rafIds.push(id);
      }
    };
    const id = requestAnimationFrame(step);
    rafIds.push(id);
  };

  const timer = setTimeout(() => {
    animateNum(numRefs[0]!, dashStats[0]!.target, dashStats[0]!.suffix);
    animateNum(numRefs[1]!, dashStats[1]!.target, dashStats[1]!.suffix);
    animateNum(numRefs[2]!, dashStats[2]!.target, dashStats[2]!.suffix);
  }, 1200);

  onUnmounted(() => {
    clearTimeout(timer);
    rafIds.forEach(id => cancelAnimationFrame(id));
    rafIds.length = 0;
    numRefs.length = 0;
  });
});
</script>
