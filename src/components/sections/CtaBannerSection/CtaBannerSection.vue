<template>
  <section :class="s.section" id="cta">
    <div :class="s.glow" aria-hidden="true" />
    <div class="container">
      <RevealWrapper :class-name="s.content">
        <h2 :class="s.title">{{ t('cta.title') }}</h2>
        <p :class="s.subtitle">{{ t('cta.sub') }}</p>
        <div :class="s.btns">
          <button :class="s.btnWhite" @click="modalStore.openModal()">{{ t('cta.btn1') }}</button>
          <button :class="s.btnOutline" @click="modalStore.openModal()">{{ t('cta.btn2') }}</button>
        </div>
      </RevealWrapper>
    </div>
  </section>
</template>

<script setup>
import { useModalStore } from '@/stores/modal.pinia.js';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './CtaBannerSection.module.css';

const { t } = useI18n();
const modalStore = useModalStore();
</script>
