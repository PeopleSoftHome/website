<template>
  <div>
    <AiConfigAssistant
      :page="page"
      :sections="sections"
      @apply-image="$emit('apply-image', $event)"
      @apply-copy="$emit('apply-copy', $event)"
    />

    <el-card shadow="hover" style="margin-top:16px">
      <template #header>
        <span>{{ t('pageConfig.registryCount', { count: REGISTERED_SECTIONS.length }) }}</span>
      </template>

      <el-table :data="REGISTERED_SECTIONS" size="small" :border="true">
        <el-table-column :label="t('pageConfig.key')" width="110" prop="key" />
        <el-table-column :label="t('pageConfig.name')" prop="title" />
        <el-table-column :label="t('pageConfig.inCms')" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="isInCms(row.key) ? 'success' : 'info'" size="small">
              {{ isInCms(row.key) ? t('pageConfig.yes') : t('pageConfig.no') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-alert :title="t('pageConfig.tip')" type="info" :closable="false" style="margin-top:16px">
        <p style="margin:0;font-size:13px;line-height:1.6">
          • {{ t('pageConfig.dragHint') }}<br>
          • {{ t('pageConfig.disableHint') }}<br>
          • {{ t('pageConfig.skipHint') }}<br>
          • {{ t('pageConfig.saveToTakeEffect') }}
        </p>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AiConfigAssistant from '@/components/AiConfigAssistant.vue';
import { REGISTERED_SECTIONS } from '@/data/sectionRegistry.js';

const { t } = useI18n();

const props = defineProps({
  page: { type: Object, default: null },
  sections: { type: Array, default: () => [] },
});

defineEmits(['apply-image', 'apply-copy']);

const isInCms = computed(() => (key) => props.sections.some((s) => s.key === key));
</script>
