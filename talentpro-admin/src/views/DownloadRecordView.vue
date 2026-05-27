<template>
  <div>
    <h2 style="margin-bottom:20px">下载留资记录</h2>

    <el-card shadow="hover">
      <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
        <el-input v-model="filterResourceId" placeholder="资源ID筛选" size="small" clearable style="width:200px" />
        <el-button type="primary" size="small" @click="fetchRecords">筛选</el-button>
        <el-button size="small" @click="exportData">导出 CSV</el-button>
      </div>

      <el-table :data="records" v-loading="loading" size="default">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="company" label="公司" width="150" />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column prop="resourceId" label="资源ID" width="220" show-overflow-tooltip />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.userId" size="small" type="success">注册用户</el-tag>
            <el-tag v-else size="small" type="info">访客</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下载时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="fetchRecords"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import client from '@/api/client.js';
import { ElMessage } from 'element-plus';

const records = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const filterResourceId = ref('');

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';

const fetchRecords = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, pageSize: pageSize.value };
    if (filterResourceId.value) params.resourceId = filterResourceId.value;
    const res = await client.get('/downloads', { params });
    records.value = res.data.data ?? [];
    total.value = res.data.meta?.total ?? 0;
  } catch (e) {
    ElMessage.error('加载下载记录失败');
  }
  loading.value = false;
};

const exportData = () => {
  const headers = ['姓名,邮箱,公司,手机,资源ID,用户ID,下载时间'];
  const rows = records.value.map(r =>
    `${r.name || ''},${r.email || ''},${r.company || ''},${r.phone || ''},${r.resourceId || ''},${r.userId || ''},${formatDate(r.createdAt)}`
  );
  const blob = new Blob(['\uFEFF' + headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `download-records-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

onMounted(fetchRecords);
</script>
