<template>
  <div>
    <h2 style="margin-bottom: 20px">行业方案管理</h2>
    <el-card shadow="hover">
      <CmsTable
        api-url="/cms/industries"
        :columns="columns"
        :form-fields="formFields"
      />
    </el-card>
  </div>
</template>

<script setup>
import CmsTable from '@/components/CmsTable.vue';

const columns = [
  { prop: 'name', label: '名称' },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'icon', label: '图标' },
  { prop: 'metrics', label: '指标数据', minWidth: 180, type: 'json' },
  { prop: 'isActive', label: '启用', width: 100, type: 'switch' },
  { prop: 'sortOrder', label: '排序', width: 100 },
];

const formFields = [
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 4 },
  { prop: 'icon', label: '图标', type: 'input' },
  { prop: 'metrics', label: '指标数据', type: 'textarea', rows: 4, placeholder: '请输入 JSON 格式数据，例如：{"employees": "10万+", "efficiency": "+30%"}' },
  { prop: 'isActive', label: '启用', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];
</script>
