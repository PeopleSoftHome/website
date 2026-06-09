<template>
  <div>
    <h2 style="margin-bottom: 20px">应用分类管理</h2>
    <el-card shadow="hover">
      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/categories"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-parentId="{ row }">
          <span>{{ row.parent?.name || (row.parentId ? row.parentId : '顶级分类') }}</span>
        </template>
        <template #column-sortOrder="{ row }">
          <span>{{ row.sortOrder ?? '-' }}</span>
        </template>
      </CmsTable>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CmsTable from '@/components/CmsTable.vue';

const tableRef = ref(null);

const columns = [
  { prop: 'name', label: '分类名称', minWidth: 160 },
  { prop: 'slug', label: 'Slug', width: 140 },
  { prop: 'parentId', label: '父分类', width: 140 },
  { prop: 'sortOrder', label: '排序', width: 90 },
  { prop: 'description', label: '描述', minWidth: 200 },
];

const formFields = [
  { prop: 'name', label: '分类名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'parentId', label: '父分类 ID', type: 'input', placeholder: '留空表示顶级分类' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 3 },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
