<template>
  <div>
    <h2 style="margin-bottom:20px">审计日志</h2>
    <el-card shadow="hover">
      <el-table :data="logs" v-loading="loading" size="default">
        <el-table-column prop="userId" label="用户ID" width="200" />
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="resource" label="资源" width="120" />
        <el-table-column prop="resourceId" label="资源ID" width="200" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="User Agent" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="fetchLogs"
      />
    </el-card>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';

const logs = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/settings/audit-logs?page=${page.value}&pageSize=${pageSize.value}`);
    logs.value = res.data || [];
    total.value = res.meta?.total || 0;
  } catch (e) {
    ElMessage.error('加载失败');
  }
  loading.value = false;
};

onMounted(fetchLogs);
</script>
