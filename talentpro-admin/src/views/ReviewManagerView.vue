<template>
  <div>
    <h2 style="margin-bottom: 20px">应用评价管理</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px">
        <el-input v-model="searchAppSlug" placeholder="输入应用 slug 筛选" clearable style="width: 220px" @change="handleFilterChange" />
        <el-button type="primary" @click="handleFilterChange">查询</el-button>
      </div>

      <CmsTable
        ref="tableRef"
        :api-url="reviewsApiUrl"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-rating="{ row }">
          <span style="color: #f59e0b; font-weight: 600">{{ '★'.repeat(row.rating) }}{{ '☆'.repeat(5 - row.rating) }}</span>
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

<script setup>
import { ref, computed } from 'vue';
import CmsTable from '@/components/CmsTable.vue';

const tableRef = ref(null);
const searchAppSlug = ref('');

const reviewsApiUrl = computed(() => {
  if (searchAppSlug.value) {
    return `/marketplace/apps/${searchAppSlug.value}/reviews`;
  }
  return '/marketplace/apps/ai-interview-bot/reviews';
});

const columns = [
  { prop: 'appName', label: '应用', width: 140, formatter: (row) => row.app?.name || '-' },
  { prop: 'rating', label: '评分', width: 120 },
  { prop: 'title', label: '标题', width: 160 },
  { prop: 'content', label: '内容', minWidth: 240 },
  { prop: 'userName', label: '用户', width: 120, formatter: (row) => row.user?.name || row.userId },
  { prop: 'createdAt', label: '时间', width: 160, formatter: (row) => formatDate(row.createdAt) },
];

const formFields = [
  { prop: 'rating', label: '评分', type: 'number' },
  { prop: 'title', label: '标题', type: 'input' },
  { prop: 'content', label: '内容', type: 'textarea', rows: 4 },
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
