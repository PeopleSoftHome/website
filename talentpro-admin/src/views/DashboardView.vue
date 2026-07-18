<!--
  Dashboard View 组件

  位于: views/DashboardView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('dashboard.title') }}</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in statCards" :key="card.titleKey">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;gap:12px">
            <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div style="font-size:13px;color:var(--admin-text-secondary)">{{ t(card.titleKey) }}</div>
              <div style="font-size:24px;font-weight:700">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('dashboard.leadTrend') }}</span></template>
          <v-chart :option="leadChartOption" style="height:240px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('dashboard.recentLeads') }}</span></template>
          <el-table :data="recentLeads" size="small" v-loading="loading">
            <el-table-column prop="name" :label="t('dashboard.name')" width="100" />
            <el-table-column prop="company" :label="t('dashboard.company')" />
            <el-table-column prop="phone" :label="t('dashboard.phone')" width="120" />
            <el-table-column prop="createdAt" :label="t('dashboard.time')" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatDate';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client';

const { t } = useI18n();

const statCards = ref([
  { titleKey: 'dashboard.todayLeads', value: '-', icon: 'Phone', color: 'var(--admin-color-primary)' },
  { titleKey: 'dashboard.monthLeads', value: '-', icon: 'TrendCharts', color: 'var(--admin-color-success)' },
  { titleKey: 'dashboard.totalUsers', value: '-', icon: 'User', color: 'var(--admin-color-warning)' },
  { titleKey: 'dashboard.pendingLeads', value: '-', icon: 'Timer', color: 'var(--admin-color-danger)' },
]);

const leadTrend = ref([3, 5, 2, 8, 6, 4, 7]);
const recentLeads = ref([]);
const loading = ref(false);

const leadChartOption = computed(() => {
  const dates = leadTrend.value.map((d) => d.date?.slice(5) || '');
  const counts = leadTrend.value.map((d) => d.count || 0);
  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dates.length ? dates : t('dashboard.weekdays'),
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: counts.length ? counts : [3, 5, 2, 8, 6, 4, 7],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(27,95,235,0.3)' },
              { offset: 1, color: 'rgba(27,95,235,0.05)' },
            ],
          },
        },
        itemStyle: { color: '#1B5FEB' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
});


const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 分钟
let refreshTimer = null;

const loadDashboard = async () => {
  loading.value = true;
  try {
    const stats = await client.get('/analytics/dashboard');
    statCards.value[0].value = stats.data.todayLeads ?? 0;
    statCards.value[1].value = stats.data.monthLeads ?? 0;
    statCards.value[2].value = stats.data.totalUsers ?? 0;
    statCards.value[3].value = stats.data.pendingLeads ?? 0;
    if (stats.data.leadTrend) leadTrend.value = stats.data.leadTrend;
  } catch { /* fallback to defaults */ }

  try {
    const leads = await client.get('/demo-bookings?pageSize=5');
    recentLeads.value = Array.isArray(leads.data) ? leads.data : [];
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(() => {
  loadDashboard();
  refreshTimer = setInterval(loadDashboard, REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});
</script>
