<!--
  Download Record View 组件

  位于: views/DownloadRecordView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('downloadRecords.title') }}</h2>

    <el-card shadow="hover">
      <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
        <el-input v-model="filterResourceId" :placeholder="t('downloadRecords.filterResourceId')" size="small" clearable style="width:200px" />
        <el-button type="primary" size="small" @click="fetchRecords">{{ t('downloadRecords.filter') }}</el-button>
        <el-button size="small" @click="exportData">{{ t('downloadRecords.exportCsv') }}</el-button>
      </div>

      <el-table :data="records" v-loading="loading" size="default">
        <el-table-column prop="name" :label="t('downloadRecords.name')" width="100" />
        <el-table-column prop="email" :label="t('downloadRecords.email')" width="200" />
        <el-table-column prop="company" :label="t('downloadRecords.company')" width="150" />
        <el-table-column prop="phone" :label="t('downloadRecords.phone')" width="130" />
        <el-table-column prop="resourceId" :label="t('downloadRecords.resourceId')" width="220" show-overflow-tooltip />
        <el-table-column :label="t('downloadRecords.user')" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.userId" size="small" type="success">{{ t('downloadRecords.registeredUser') }}</el-tag>
            <el-tag v-else size="small" type="info">{{ t('downloadRecords.visitor') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('downloadRecords.downloadTime')" width="160">
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

<script setup lang="ts">
// @ts-nocheck
import { formatDate } from '@/utils/formatDate';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client';
import { ElMessage } from 'element-plus';

const { t } = useI18n();

const records = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const filterResourceId = ref('');


const fetchRecords = async () => {
  loading.value = true;
  try {
    let url = `/downloads?page=${page.value}&pageSize=${pageSize.value}`;
    if (filterResourceId.value) url += `&resourceId=${filterResourceId.value}`;
    const res = await client.get(url);
    records.value = res.data || [];
    total.value = res.meta?.total || 0;
  } catch (e) {
    ElMessage.error(t('downloadRecords.loadFailed'));
  }
  loading.value = false;
};

const exportData = () => {
  const headers = [t('downloadRecords.name') + ',' + t('downloadRecords.email') + ',' + t('downloadRecords.company') + ',' + t('downloadRecords.phone') + ',' + t('downloadRecords.resourceId') + ',userId,' + t('downloadRecords.downloadTime')];
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
