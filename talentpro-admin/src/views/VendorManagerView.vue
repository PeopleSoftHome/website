<template>
  <div>
    <h2 style="margin-bottom: 20px">应用厂商管理</h2>
    <el-card shadow="hover">
      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/vendors"
        :columns="columns"
        :form-fields="formFields"
      >
        <template #column-revenueShareRate="{ row }">
          <span>{{ row.revenueShareRate != null ? `${(row.revenueShareRate * 100).toFixed(0)}%` : '-' }}</span>
        </template>
        <template #column-isVerified="{ row }">
          <el-tag :type="row.isVerified ? 'success' : 'info'" size="small">
            {{ row.isVerified ? '已认证' : '未认证' }}
          </el-tag>
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
  { prop: 'name', label: '厂商名称', minWidth: 160 },
  { prop: 'slug', label: 'Slug', width: 140 },
  { prop: 'contactEmail', label: '联系邮箱', width: 180 },
  { prop: 'website', label: '官网', minWidth: 180 },
  { prop: 'revenueShareRate', label: '分成比例', width: 100 },
  { prop: 'isVerified', label: '认证状态', width: 100 },
];

const formFields = [
  { prop: 'name', label: '厂商名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'description', label: '简介', type: 'textarea', rows: 3 },
  { prop: 'contactEmail', label: '联系邮箱', type: 'input' },
  { prop: 'website', label: '官网', type: 'input' },
  { prop: 'revenueShareRate', label: '分成比例', type: 'number', placeholder: '0.3 表示 30%' },
  { prop: 'isVerified', label: '已认证', type: 'switch' },
];
</script>
