<template>
  <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap">
    <el-select
      :model-value="filterStatus"
      :placeholder="t('orders.allStatus')"
      clearable
      style="width: 140px"
      @change="onStatusChange"
    >
      <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
    </el-select>
    <el-select
      :model-value="filterProvider"
      :placeholder="t('orders.allProviders')"
      clearable
      style="width: 140px"
      @change="onProviderChange"
    >
      <el-option v-for="(label, key) in providerMap" :key="key" :label="label" :value="key" />
    </el-select>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  filterStatus: { type: String, default: '' },
  filterProvider: { type: String, default: '' },
  statusMap: { type: Object, required: true },
  providerMap: { type: Object, required: true },
});

const emit = defineEmits(['change', 'update:filterStatus', 'update:filterProvider']);

const onStatusChange = (val) => {
  emit('update:filterStatus', val);
  emit('change');
};

const onProviderChange = (val) => {
  emit('update:filterProvider', val);
  emit('change');
};
</script>
