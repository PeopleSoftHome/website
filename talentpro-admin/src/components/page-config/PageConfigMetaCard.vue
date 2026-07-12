<!--
  Page Config Meta Card 组件

  位于: components/page-config/PageConfigMetaCard.vue
-->
<template>
  <el-card shadow="hover" style="margin-top:16px">
    <template #header>
      <span>{{ t('pageConfig.pageMeta') }}</span>
    </template>
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item :label="t('pageConfig.slug')">{{ page.slug }}</el-descriptions-item>
      <el-descriptions-item :label="t('pageConfig.pageTitle')">{{ page.title }}</el-descriptions-item>
      <el-descriptions-item :label="t('pageConfig.metaTitle')">{{ page.metaTitle || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="t('pageConfig.metaDesc')">{{ page.metaDesc || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  page: { type: Object, required: true },
});
</script>
