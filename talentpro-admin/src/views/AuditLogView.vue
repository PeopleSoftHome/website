<!--
  Audit Log View 组件

  位于: views/AuditLogView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('auditLogs.title') }}</h2>
    <el-card shadow="hover">
      <el-table :data="logs" v-loading="loading" size="default">
        <el-table-column prop="userId" :label="t('auditLogs.userId')" width="200" />
        <el-table-column prop="action" :label="t('auditLogs.action')" width="120" />
        <el-table-column prop="resource" :label="t('auditLogs.resource')" width="120" />
        <el-table-column prop="resourceId" :label="t('auditLogs.resourceId')" width="200" />
        <el-table-column prop="ipAddress" :label="t('auditLogs.ipAddress')" width="140" />
        <el-table-column prop="userAgent" :label="t('auditLogs.userAgent')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" :label="t('auditLogs.time')" width="170">
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

<script setup lang="ts">
// @ts-nocheck
import { formatDate } from '@/utils/formatDate';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import client from '@/api/client';

const { t } = useI18n();

const logs = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/system/audit-logs?page=${page.value}&pageSize=${pageSize.value}`);
    logs.value = res.data || [];
    total.value = res.meta?.total || 0;
  } catch (e) {
    ElMessage.error(t('auditLogs.loadFailed'));
  }
  loading.value = false;
};

onMounted(fetchLogs);
</script>
