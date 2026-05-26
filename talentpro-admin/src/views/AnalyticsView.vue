<template>
  <div>
    <h2 style="margin-bottom:20px">数据分析</h2>

    <!-- 概览卡片 -->
    <el-row :gutter="16">
      <el-col :span="8" v-for="card in overviewCards" :key="card.label">
        <el-card shadow="hover">
          <div style="display:flex;align-items:center;gap:12px">
            <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
            <div>
              <div style="font-size:13px;color:#666">{{ card.label }}</div>
              <div style="font-size:28px;font-weight:700">{{ card.value.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 转化漏斗 -->
    <el-card shadow="hover" style="margin-top:16px">
      <template #header><span>转化漏斗</span></template>
      <div v-if="funnel.length" style="max-width:600px">
        <div v-for="(step, i) in funnel" :key="i" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
            <span>{{ step.name }}</span>
            <span style="font-weight:600">{{ step.count.toLocaleString() }} <span v-if="step.rate" style="color:#666;font-weight:400">({{ step.rate }})</span></span>
          </div>
          <el-progress
            :percentage="Math.round((step.count / funnel[0].count) * 100)"
            :color="funnelColors[i]"
            :stroke-width="18"
            :show-text="false"
          />
        </div>
      </div>
      <el-empty v-else description="暂无数据" />
    </el-card>

    <!-- 每日趋势 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>每日页面浏览量</span></template>
          <div v-if="dailyPageViews.length" style="display:flex;align-items:flex-end;gap:4px;justify-content:space-around;height:240px;padding:0 8px">
            <div v-for="(item, i) in dailyPageViews" :key="i" style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0">
              <div style="font-size:11px;color:#666;white-space:nowrap">{{ item.count }}</div>
              <div :style="{width:'70%',height:(maxPV ? (item.count / maxPV * 200) : 0) + 'px',background:'linear-gradient(180deg,#1B5FEB,#4B82F5)',borderRadius:'3px 3px 0 0',minHeight:'2px'}" />
              <div style="font-size:11px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;text-align:center">{{ formatShortDate(item.date) }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>每日事件数</span></template>
          <div v-if="dailyEvents.length" style="display:flex;align-items:flex-end;gap:4px;justify-content:space-around;height:240px;padding:0 8px">
            <div v-for="(item, i) in dailyEvents" :key="i" style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0">
              <div style="font-size:11px;color:#666;white-space:nowrap">{{ item.count }}</div>
              <div :style="{width:'70%',height:(maxEV ? (item.count / maxEV * 200) : 0) + 'px',background:'linear-gradient(180deg,#10B981,#34D399)',borderRadius:'3px 3px 0 0',minHeight:'2px'}" />
              <div style="font-size:11px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;text-align:center">{{ formatShortDate(item.date) }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门页面 & 热门事件 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>热门页面 TOP10</span></template>
          <el-table :data="topPages" size="small">
            <el-table-column type="index" width="40" />
            <el-table-column prop="path" label="页面路径" />
            <el-table-column prop="_count.path" label="浏览量" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>热门事件 TOP10</span></template>
          <el-table :data="topEvents" size="small">
            <el-table-column type="index" width="40" />
            <el-table-column prop="event" label="事件名称" />
            <el-table-column prop="_count.event" label="触发次数" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';

const overview = ref({ totalPageViews: 0, totalEvents: 0, uniqueSessions: 0 });
const topPages = ref([]);
const topEvents = ref([]);
const dailyPageViews = ref([]);
const dailyEvents = ref([]);
const funnel = ref([]);
const loading = ref(false);

const overviewCards = computed(() => [
  { label: '总页面浏览量', value: overview.value.totalPageViews, icon: 'View', color: '#1B5FEB' },
  { label: '总事件数', value: overview.value.totalEvents, icon: 'Histogram', color: '#10B981' },
  { label: '独立会话', value: overview.value.uniqueSessions, icon: 'User', color: '#F59E0B' },
]);

const maxPV = computed(() => Math.max(...dailyPageViews.value.map((d) => d.count), 1));
const maxEV = computed(() => Math.max(...dailyEvents.value.map((d) => d.count), 1));

const funnelColors = ['#1B5FEB', '#4B82F5', '#10B981', '#F59E0B'];

const formatShortDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

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
    ElMessage.error('加载数据失败');
  }
  loading.value = false;
};

onMounted(fetchData);
</script>
