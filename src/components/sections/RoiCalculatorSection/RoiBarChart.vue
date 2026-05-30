<template>
  <div :class="s.chart">
    <div :class="s.bars">
      <div :class="s.barWrap">
        <div
          :class="[s.bar, s.barBefore]"
          :style="{ height: beforePct + '%' }"
          aria-hidden="true"
        />
        <span :class="s.barLabel">{{ t('roi.chartBefore') }}</span>
        <span :class="s.barValue">¥{{ formatNum(before) }}</span>
      </div>
      <div :class="s.barWrap">
        <div
          :class="[s.bar, s.barAfter]"
          :style="{ height: afterPct + '%' }"
          aria-hidden="true"
        />
        <span :class="s.barLabel">{{ t('roi.chartAfter') }}</span>
        <span :class="s.barValue">¥{{ formatNum(after) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import s from './RoiCalculatorSection.module.css';

const props = defineProps({
  before: { type: Number, required: true },
  after:  { type: Number, required: true },
});

const { t } = inject('i18n', { t: (k) => k });

const max = computed(() => Math.max(props.before, props.after, 1));
const beforePct = computed(() => (props.before / max.value) * 100);
const afterPct  = computed(() => (props.after  / max.value) * 100);

function formatNum(v) {
  if (v >= 10000) return (v / 10000).toFixed(1) + t('units.tenThousand');
  return v.toLocaleString();
}
</script>
