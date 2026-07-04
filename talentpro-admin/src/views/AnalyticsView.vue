<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('analytics.title') }}</h2>

    <!-- 概览卡片 -->
    <el-row :gutter="16">
      <el-col :span="8" v-for="card in overviewCards" :key="card.label">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;gap:12px">
            <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div style="font-size:13px;color:var(--admin-text-secondary)">{{ card.label }}</div>
              <div style="font-size:28px;font-weight:700">{{ card.value.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 转化漏斗 -->
    <el-card shadow="hover" style="margin-top:16px">
      <template #header><span>{{ t('analytics.conversionFunnel') }}</span></template>
      <div v-if="funnel.length" style="max-width:600px">
        <div v-for="(step, i) in funnel" :key="i" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
            <span>{{ step.name }}</span>
            <span style="font-weight:600">{{ step.count.toLocaleString() }} <span v-if="step.rate" style="color:var(--admin-text-secondary);font-weight:400">({{ step.rate }})</span></span>
          </div>
          <el-progress
            :percentage="Math.round((step.count / funnel[0].count) * 100)"
            :color="funnelColors[i]"
            :stroke-width="18"
            :show-text="false"
          />
        </div>
      </div>
      <el-empty v-else :description="t('analytics.noData')" />
    </el-card>

    <!-- 每日趋势 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('analytics.dailyPageViews') }}</span></template>
          <v-chart :option="pageViewChartOption" style="height:260px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('analytics.dailyEvents') }}</span></template>
          <v-chart :option="eventChartOption" style="height:260px" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门页面 & 热门事件 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('analytics.topPages') }}</span></template>
          <el-table :data="topPages" size="small">
            <el-table-column type="index" width="40" />
            <el-table-column prop="path" :label="t('analytics.pagePath')" />
            <el-table-column prop="_count.path" :label="t('analytics.views')" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('analytics.topEvents') }}</span></template>
          <el-table :data="topEvents" size="small">
            <el-table-column type="index" width="40" />
            <el-table-column prop="event" :label="t('analytics.eventName')" />
            <el-table-column prop="_count.event" :label="t('analytics.triggers')" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 事件分布饼图 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>{{ t('analytics.eventTypeDistribution') }}</span></template>
          <v-chart :option="eventPieOption" style="height:300px" autoresize />
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

const overview = ref({ totalPageViews: 0, totalEvents: 0, uniqueSessions: 0 });
const topPages = ref([]);
const topEvents = ref([]);
const dailyPageViews = ref([]);
const dailyEvents = ref([]);
const funnel = ref([]);
const loading = ref(false);

const overviewCards = computed(() => [
  { label: t('analytics.totalPageViews'), value: overview.value.totalPageViews, icon: 'View', color: 'var(--admin-color-primary)' },
  { label: t('analytics.totalEvents'), value: overview.value.totalEvents, icon: 'Histogram', color: 'var(--admin-color-success)' },
  { label: t('analytics.uniqueSessions'), value: overview.value.uniqueSessions, icon: 'User', color: 'var(--admin-color-warning)' },
]);

const formatShortDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const pageViewChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dailyPageViews.value.map((d) => formatShortDate(d.date)),
  },
  yAxis: { type: 'value' },
  series: [
    {
      data: dailyPageViews.value.map((d) => d.count),
      type: 'bar',
      itemStyle: { color: '#1B5FEB', borderRadius: [4, 4, 0, 0] },
    },
  ],
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
}));

const eventChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: dailyEvents.value.map((d) => formatShortDate(d.date)),
  },
  yAxis: { type: 'value' },
  series: [
    {
      data: dailyEvents.value.map((d) => d.count),
      type: 'bar',
      itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
    },
  ],
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
}));

const eventPieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { top: '5%', left: 'center' },
  series: [
    {
      name: t('analytics.eventType'),
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: topEvents.value.map((item) => ({
        name: item.event,
        value: item._count?.event || 0,
      })),
    },
  ],
}));

const funnelColors = ['#1B5FEB', '#4B82F5', '#10B981', '#F59E0B'];

const fetchData = async () => {
  loading.value = true;
  try {
    const [dash, funnelRes] = await Promise.all([
      client.get('/analytics/dashboard?days=30'),
      client.get('/analytics/funnel'),
    ]);
    overview.value = dash.data?.overview || { totalPageViews: 0, totalEvents: 0, uniqueSessions: 0 };
    topPages.value = (dash.data?.topPages || []).slice(0, 10);
    topEvents.value = (dash.data?.topEvents || []).slice(0, 10);
    dailyPageViews.value = dash.data?.dailyPageViews || [];
    dailyEvents.value = dash.data?.dailyEvents || [];
    funnel.value = funnelRes.data?.steps || [];
  } catch (e) {
    ElMessage.error(t('analytics.loadFailed'));
  }
  loading.value = false;
};

onMounted(fetchData);
</script>
