<template>
  <div>
    <h2 style="margin-bottom: 20px">统计数据管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/stats"
        :columns="columns"
        :form-fields="formFields"
      />
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'label', label: '标签' },
  { prop: 'value', label: '值' },
  { prop: 'suffix', label: '后缀' },
  { prop: 'isActive', label: '启用', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'label', label: '标签', type: 'input' },
  { prop: 'value', label: '值', type: 'input' },
  { prop: 'suffix', label: '后缀', type: 'input' },
  { prop: 'isActive', label: '启用', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
