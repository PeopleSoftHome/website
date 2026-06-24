<template>
  <div>
    <div :class="s.grid9Label">
      <span>{{ t('industry.performance') }} <Icon name="arrow-right" :size="12" /></span>
      <span style="position:absolute;left:-20px;top:50%;transform:translateY(-50%) rotate(-90deg);font-size:10px;">{{ t('industry.potential') }}</span>
    </div>
    <div :class="s.grid9">
      <div
        v-for="(cell, i) in (data.cells || [])"
        :key="i"
        :class="s.grid9Cell"
        :style="{ background: cell.bg }"
      >
        <div :class="s.grid9Name" :style="{ color: cell.color }">{{ cell.label }}</div>
        <div :class="s.grid9Count" :style="{ color: cell.color }">{{ cell.count }}{{ t('units.people') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import s from '../ProductScreenshot.module.css';
import Icon from '../../../ui/Icon/Icon.vue';

const { t } = useI18n();

defineProps({ data: { type: Object, required: true } });
</script>
