<template>
  <div>
    <table :class="s.table">
      <thead>
        <tr><th>{{ t('industry.table.employee') }}</th><th>{{ t('industry.table.shift') }}</th><th>{{ t('industry.table.clockIn') }}</th><th>{{ t('industry.table.status') }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in (data.rows || [])" :key="row.name">
          <td>{{ row.name }}</td>
          <td>{{ row.shift }}</td>
          <td>{{ row.time }}</td>
          <td>
            <span :class="[s.dot, s[`dot_${row.status}`]]" />
            {{ row.label }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.tip" :class="s.tip">
      <div :class="s.tipLabel">{{ t('industry.table.aiTip') }}</div>
      <div :class="s.tipText">{{ data.tip }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import s from '../ProductScreenshot.module.css';

const { t } = useI18n();

defineProps({ data: { type: Object, required: true } });
</script>
