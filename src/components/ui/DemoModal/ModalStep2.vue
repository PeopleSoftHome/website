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

<script setup>
import { ref, watch, computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import s from './DemoModal.module.css';

const { t } = useI18n();
const modalStore = useModalStore();
const PRODUCTS = t('modal.products') || [];
const selected = ref(new Set(PRODUCTS.slice(0, 1)));

watch(selected, (val) => {
  modalStore.formData.value.products = Array.from(val);
}, { deep: true, immediate: true });

const toggle = (p) => {
  const next = new Set(selected.value);
  next.has(p) ? next.delete(p) : next.add(p);
  selected.value = next;
};

// 智能推荐规则：基于已选产品推荐关联产品
const RECOMMEND_MAP = {
  '招聘管理':  ['人才测评', 'AI Family'],
  '假勤管理':  ['薪酬管理', '组织人事'],
  '绩效管理':  ['组织人事', 'AI Family'],
  '组织人事':  ['假勤管理', '薪酬管理', '绩效管理'],
  '薪酬管理':  ['假勤管理', '组织人事'],
  '人才测评':  ['招聘管理', 'AI Family'],
  'AI Family': ['招聘管理', '绩效管理', '人才测评'],
};

const recommendations = computed(() => {
  const recs = new Set();
  for (const p of selected.value) {
    const mapped = RECOMMEND_MAP[p];
    if (mapped) {
      mapped.forEach((r) => { if (!selected.value.has(r)) recs.add(r); });
    }
  }
  return Array.from(recs);
});

const emit = defineEmits(['next']);
</script>
