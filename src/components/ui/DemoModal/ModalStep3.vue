<template>
  <div>
    <div :class="s.stepTitle">{{ t('modal.step3Title') }}</div>
    <div :class="s.stepSub">{{ t('modal.step3Sub') }}</div>
    <div :class="s.pills">
      <button
        v-for="scale in SCALES"
        :key="scale"
        :class="[s.pill, selected === scale ? s.pillSelected : '']"
        @click="selected = scale"
      >
        {{ scale }}
      </button>
    </div>
    <button :class="s.submitBtn" @click="emit('submit')">{{ t('modal.submit') }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import s from './DemoModal.module.css';

const { t } = useI18n();
const modalStore = useModalStore();
const SCALES = t('modal.scales') || [];
const selected = ref(SCALES[1] || '');

watch(selected, (val) => {
  modalStore.formData.value.scale = val;
}, { immediate: true });

const emit = defineEmits(['submit']);
</script>
