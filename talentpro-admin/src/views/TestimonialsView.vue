<template>
  <div>
    <h2 style="margin-bottom: 20px">客户证言管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/content/testimonial"
        :columns="columns"
        :form-fields="formFields"
        :api-params="{ status: 'all' }"
      />
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'name', label: '姓名' },
  { prop: 'title', label: '职位' },
  { prop: 'text', label: '证言内容', minWidth: 200 },
  { prop: 'industry', label: '行业' },
  { prop: 'product', label: '产品' },
  { prop: 'isActive', label: '启用', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'name', label: '姓名', type: 'input' },
  { prop: 'title', label: '职位', type: 'input' },
  { prop: 'text', label: '证言内容', type: 'textarea', rows: 4 },
  { prop: 'industry', label: '行业', type: 'input' },
  { prop: 'product', label: '产品', type: 'input' },
  { prop: 'isActive', label: '启用', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
