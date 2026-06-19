<template>
  <BaseModal
    :is-open="modalStore.isOpen.value"
    :aria-label="t('modal.step1Title')"
    :overlay-class-name="[s.overlay, modalStore.isOpen.value ? s.overlayOpen : ''].join(' ')"
    @close="modalStore.closeModal()"
  >
    <div :class="s.modal">
      <button :class="s.closeBtn" @click="modalStore.closeModal()" :aria-label="t('modal.close')">
        <Icon name="close" :size="18" />
      </button>
      <div v-if="!modalStore.isSuccess.value" :class="s.steps">
        <div
          v-for="i in 3"
          :key="i - 1"
          :class="[s.stepDot,
            i - 1 < modalStore.step.value ? s.stepDone
            : i - 1 === modalStore.step.value ? s.stepActive
            : '']"
        />
        <div :class="s.stepText">{{ stepText }}</div>
      </div>
      <div v-if="modalStore.submitError.value" :class="s.apiError">
        {{ modalStore.submitError.value }}
      </div>
      <ModalSuccess v-if="modalStore.isSuccess.value" />
      <ModalStep1 v-else-if="modalStore.step.value === 0" @next="modalStore.nextStep()" />
      <ModalStep2 v-else-if="modalStore.step.value === 1" @next="modalStore.nextStep()" />
      <ModalStep3 v-else @submit="modalStore.submitForm()" />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import Icon from '../Icon/Icon.vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import ModalStep1 from './ModalStep1.vue';
import ModalStep2 from './ModalStep2.vue';
import ModalStep3 from './ModalStep3.vue';
import ModalSuccess from './ModalSuccess.vue';
import s from './DemoModal.module.css';

const { t } = useI18n();
const modalStore = useModalStore();

const stepText = computed(() =>
  t('modal.stepText', { current: modalStore.step.value + 1, total: 3 }),
);
</script>
