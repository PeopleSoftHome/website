<template>
  <div>
    <h2 style="margin-bottom:20px">线索管理</h2>
    <el-card shadow="hover">
      <el-table :data="leads" v-loading="loading" size="default">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column prop="products" label="意向产品">
          <template #default="{ row }">
            <el-tag v-for="p in (row.products||[])" :key="p" size="small" style="margin-right:4px">{{ p }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="20"
        v-model:current-page="page"
        @current-change="fetchLeads"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import client from '@/api/client.js';

const leads = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

const statusType = (s) => {
  const map = { new: 'info', contacted: 'warning', qualified: 'success', closed: 'danger' };
  return map[s] || 'info';
};

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';

const fetchLeads = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/leads?page=${page.value}&limit=20`);
    leads.value = res.data.items ?? [];
    total.value = res.data.total ?? 0;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const openDetail = (row) => {
  // TODO: 详情抽屉
  console.log('Lead detail:', row);
};

onMounted(fetchLeads);
</script>
