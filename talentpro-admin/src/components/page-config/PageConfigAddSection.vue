<template>
  <div style="margin-top:16px;display:flex;gap:8px;align-items:center">
    <el-select v-model="selected" :placeholder="t('pageConfig.selectSection')" size="small" style="width:220px">
      <el-option
        v-for="rs in availableSections"
        :key="rs.key"
        :label="rs.title"
        :value="rs.key"
      />
    </el-select>
    <el-button type="primary" size="small" @click="onAdd" :disabled="!selected">
      {{ t('pageConfig.add') }}
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  availableSections: { type: Array, default: () => [] },
});

const emit = defineEmits(['add']);

const selected = ref('');

const onAdd = () => {
  if (!selected.value) return;
  emit('add', selected.value);
  selected.value = '';
};
</script>
