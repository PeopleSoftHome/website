<template>
  <BaseModal
    :is-open="modalStore.isOpen.value"
    :aria-label="t('modal.step1Title')"
    :overlay-class-name="[s.overlay, modalStore.isOpen.value ? s.overlayOpen : ''].join(' ')"
    @close="modalStore.closeModal()"
  >
    <div :class="s.modal">
      <button :class="s.closeBtn" @click="modalStore.closeModal()" :aria-label="t('modal.close')">✕</button>
      <div v-if="!modalStore.isSuccess.value" :class="s.steps">
        <div
          v-for="i in 3"
          :key="i - 1"
          :class="[s.stepDot,
            i - 1 < modalStore.step.value ? s.stepDone
            : i - 1 === modalStore.step.value ? s.stepActive
            : '']"
        />
      </div>
      <ModalSuccess v-if="modalStore.isSuccess.value" />
      <ModalStep1 v-else-if="modalStore.step.value === 0" @next="modalStore.nextStep()" />
      <ModalStep2 v-else-if="modalStore.step.value === 1" @next="modalStore.nextStep()" />
      <ModalStep3 v-else @submit="modalStore.submitForm()" />
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from 'vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import ModalStep1 from './ModalStep1.vue';
import ModalStep2 from './ModalStep2.vue';
import ModalStep3 from './ModalStep3.vue';
import ModalSuccess from './ModalSuccess.vue';
import s from './DemoModal.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', {});
</script>
