<template>
  <div>
    <div :class="s.stepTitle">{{ t('modal.step2Title') }}</div>
    <div :class="s.stepSub">{{ t('modal.step2Sub') }}</div>
    <div :class="s.pills">
      <button
        v-for="p in PRODUCTS"
        :key="p"
        :class="[s.pill, selected.has(p) ? s.pillSelected : '']"
        @click="toggle(p)"
      >
        {{ p }}
      </button>
    </div>

    <!-- 智能推荐 -->
    <div v-if="recommendations.length" :class="s.recommend">
      <p :class="s.recTitle">{{ t('modal.recommendTitle') }}</p>
      <div :class="s.recChips">
        <button
          v-for="r in recommendations"
          :key="r"
          :class="s.recChip"
          @click="toggle(r)"
        >
          + {{ r }}
        </button>
      </div>
    </div>

    <button :class="s.submitBtn" @click="emit('next')">{{ t('modal.next') }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import s from './DemoModal.module.css';

const { t } = useI18n();
const modalStore = useModalStore();
const PRODUCTS = (t('modal.products') as unknown as string[]) || [];
const selected = ref<Set<string>>(new Set(PRODUCTS.slice(0, 1)));

watch(selected, (val) => {
  modalStore.formData.products = Array.from(val);
}, { deep: true, immediate: true });

const toggle = (p: string) => {
  const next = new Set<string>(selected.value);
  next.has(p) ? next.delete(p) : next.add(p);
  selected.value = next;
};

// 智能推荐规则：基于产品数组下标推荐关联产品，确保多语言下稳定匹配
const RECOMMEND_MAP: Record<number, number[]> = {
  0: [1, 6], // Recruiting -> Assessment, AI Family
  2: [3, 4], // Attendance -> Payroll, HR & Org
  5: [4, 6], // Performance -> HR & Org, AI Family
  4: [2, 3, 5], // HR & Org -> Attendance, Payroll, Performance
  3: [2, 4], // Payroll -> Attendance, HR & Org
  1: [0, 6], // Assessment -> Recruiting, AI Family
  6: [0, 5, 1], // AI Family -> Recruiting, Performance, Assessment
};

const recommendations = computed(() => {
  const recs = new Set<string>();
  for (const p of selected.value) {
    const idx = PRODUCTS.indexOf(p);
    const mapped = RECOMMEND_MAP[idx];
    if (mapped) {
      mapped.forEach((rIdx) => {
        const r = PRODUCTS[rIdx];
        if (r && !selected.value.has(r)) recs.add(r);
      });
    }
  }
  return Array.from(recs);
});

const emit = defineEmits(['next']);
</script>
