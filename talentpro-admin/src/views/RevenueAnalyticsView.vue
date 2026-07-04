<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('revenueAnalytics.title') }}</h2>

    <!-- 概览卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in overviewCards" :key="card.label">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;gap:12px">
            <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div style="font-size:13px;color:var(--admin-text-secondary)">{{ card.label }}</div>
              <div style="font-size:28px;font-weight:700">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势 & 渠道 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('revenueAnalytics.revenueTrend') }}</span></template>
          <v-chart :option="revenueChartOption" style="height:300px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('revenueAnalytics.providerDistribution') }}</span></template>
          <v-chart :option="providerPieOption" style="height:300px" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 应用排行 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><span>{{ t('revenueAnalytics.topApps') }}</span></template>
          <el-table :data="topApps" size="small" v-loading="loading">
            <el-table-column type="index" width="40" />
            <el-table-column prop="appName" :label="t('revenueAnalytics.appName')" min-width="180" />
            <el-table-column prop="orders" :label="t('revenueAnalytics.orders')" width="100" />
            <el-table-column prop="revenue" :label="t('revenueAnalytics.revenue')" width="120">
              <template #default="{ row }">¥ {{ row.revenue?.toLocaleString() }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';

const { t } = useI18n();

const overview = ref({
  totalRevenue: 0,
  totalOrders: 0,
  completedOrders: 0,
  refundedOrders: 0,
});
const dailyRevenue = ref([]);
const byProvider = ref([]);
const topApps = ref([]);
const loading = ref(false);

const overviewCards = computed(() => [
  { label: t('revenueAnalytics.gmv'), value: `¥ ${overview.value.totalRevenue.toLocaleString()}`, icon: 'Money', color: 'var(--admin-color-primary)' },
  { label: t('revenueAnalytics.totalOrders'), value: overview.value.totalOrders.toLocaleString(), icon: 'Document', color: 'var(--admin-color-success)' },
  { label: t('revenueAnalytics.completedOrders'), value: overview.value.completedOrders.toLocaleString(), icon: 'CircleCheck', color: 'var(--admin-color-warning)' },
  { label: t('revenueAnalytics.refundedOrders'), value: overview.value.refundedOrders.toLocaleString(), icon: 'RefreshLeft', color: 'var(--admin-color-danger)' },
]);

const formatShortDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const revenueChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dailyRevenue.value.map((d) => formatShortDate(d.date)),
  },
  yAxis: { type: 'value' },
  series: [
    {
      data: dailyRevenue.value.map((d) => d.revenue || 0),
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
}));

const providerPieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: t('revenueAnalytics.providerDistribution'),
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: byProvider.value.map((item) => ({
        name: providerLabel(item.provider),
        value: item.revenue || item.count || 0,
      })),
    },
  ],
}));

const providerLabel = (p) => {
  return t(`revenueAnalytics.providers.${p}`, p);
};

const fetchData = async () => {
  loading.value = true;
  try {
    let res;
    try {
      res = await client.get('/payments/analytics/revenue?days=30');
    } catch {
      res = await client.get('/analytics/marketplace-revenue?days=30');
    }
    const data = res.data || {};
    overview.value = {
      totalRevenue: data.totalRevenue || 0,
      totalOrders: data.totalOrders || 0,
      completedOrders: data.completedOrders || 0,
      refundedOrders: data.refundedOrders || 0,
    };
    dailyRevenue.value = data.dailyRevenue || [];
    byProvider.value = data.byProvider || [];
    topApps.value = (data.topApps || []).slice(0, 10);
  } catch (e) {
    ElMessage.error(t('revenueAnalytics.loadFailed'));
  }
  loading.value = false;
};

onMounted(fetchData);
</script>
