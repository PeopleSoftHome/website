<template>
  <section :class="s.section" id="cta">
    <div :class="s.glow" aria-hidden="true" />
    <div class="container">
      <RevealWrapper :class-name="s.content">
        <h2 :class="s.title">{{ t('cta.title') }}</h2>
        <p :class="s.subtitle">{{ t('cta.sub') }}</p>
        <div :class="s.btns">
          <button :class="s.btnWhite" @click="onCtaClick">{{ ctaText }}</button>
          <button :class="s.btnOutline" @click="modalStore.openModal()">{{ t('cta.btn2') }}</button>
        </div>
      </RevealWrapper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import { useExperiment } from '@/shared/composables/useExperiment';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './CtaBannerSection.module.css';

const { t } = useI18n();
const modalStore = useModalStore();

// A/B 实验（key: cta-banner-copy）：变体 config.ctaText 覆盖主按钮文案；点击主按钮计为转化
const { config, trackConversion } = useExperiment('cta-banner-copy');
const ctaText = computed(() => (config.value.ctaText as string) || t('cta.btn1'));

const onCtaClick = () => {
  trackConversion({ source: 'cta-banner' });
  modalStore.openModal();
};
</script>
