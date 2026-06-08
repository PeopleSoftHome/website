<template>
  <div>
    <h2 style="margin-bottom:20px">仪表盘</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;gap:12px">
            <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div style="font-size:13px;color:#666">{{ card.title }}</div>
              <div style="font-size:24px;font-weight:700">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>最近 7 天线索趋势</span></template>
          <v-chart :option="leadChartOption" style="height:240px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>最近线索</span></template>
          <el-table :data="recentLeads" size="small" v-loading="loading">
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="company" label="公司" />
            <el-table-column prop="phone" label="手机" width="120" />
            <el-table-column prop="createdAt" label="时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import client from '@/api/client.js';

const statCards = ref([
  { title: '今日线索', value: '-', icon: 'Phone', color: '#1B5FEB' },
  { title: '本月线索', value: '-', icon: 'TrendCharts', color: '#10B981' },
  { title: '总用户', value: '-', icon: 'User', color: '#F59E0B' },
  { title: '待跟进', value: '-', icon: 'Timer', color: '#EF4444' },
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
      data: dates.length ? dates : ['一', '二', '三', '四', '五', '六', '日'],
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
