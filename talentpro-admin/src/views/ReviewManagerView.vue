<!--
  Review Manager View 组件

  位于: views/ReviewManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('reviews.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px">
        <el-input v-model="searchAppSlug" :placeholder="t('reviews.filterPlaceholder')" clearable style="width: 220px" @change="handleFilterChange" />
        <el-button type="primary" @click="handleFilterChange">{{ t('reviews.query') }}</el-button>
      </div>

      <CmsTable
        ref="tableRef"
        :api-url="reviewsApiUrl"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-rating="{ row }">
          <span style="color: var(--admin-color-warning); font-weight: 600">{{ '★'.repeat(row.rating) }}{{ '☆'.repeat(5 - row.rating) }}</span>
        </template>
        <template #column-content="{ row }">
          <el-tooltip placement="top" :content="row.content">
            <span class="ellipsis">{{ row.content }}</span>
          </el-tooltip>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CmsTable from '@/components/ui/CmsTable.vue';

const { t } = useI18n();

const tableRef = ref(null);
const searchAppSlug = ref('');

const reviewsApiUrl = computed(() => {
  if (searchAppSlug.value) {
    return `/marketplace/apps/${searchAppSlug.value}/reviews`;
  }
  return '/marketplace/apps/smart-resume-screen/reviews';
});

const columns = [
  { prop: 'appName', label: t('reviews.app'), width: 140, formatter: (row) => row.app?.name || '-' },
  { prop: 'rating', label: t('reviews.rating'), width: 120 },
  { prop: 'title', label: t('reviews.titleCol'), width: 160 },
  { prop: 'content', label: t('reviews.content'), minWidth: 240 },
  { prop: 'userName', label: t('reviews.user'), width: 120, formatter: (row) => row.user?.name || row.userId },
  { prop: 'createdAt', label: t('reviews.time'), width: 160, formatter: (row) => formatDate(row.createdAt) },
];

const formFields = [
  { prop: 'rating', label: t('reviews.rating'), type: 'number' },
  { prop: 'title', label: t('reviews.titleCol'), type: 'input' },
  { prop: 'content', label: t('reviews.content'), type: 'textarea', rows: 4 },
];

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleString('zh-CN');
};

const handleFilterChange = () => {
  if (tableRef.value) {
    tableRef.value.refresh();
  }
};
</script>

<style scoped>
.ellipsis {
  display: inline-block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
