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
        <el-card shadow="hover" title="最近 7 天线索趋势">
          <template #header><span>最近 7 天线索趋势</span></template>
          <div style="height:240px;display:flex;align-items:flex-end;gap:8px;justify-content:space-around;padding:0 20px">
            <div v-for="(v, i) in leadTrend" :key="i" style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1">
              <div style="font-size:12px;color:#666">{{ v }}</div>
              <div :style="{width:'60%',height:(v*8)+'px',background:'linear-gradient(180deg,#1B5FEB,#4B82F5)',borderRadius:'4px 4px 0 0',minHeight:'4px'}" />
              <div style="font-size:12px;color:#999">{{ ['一','二','三','四','五','六','日'][i] }}</div>
            </div>
          </div>
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
import { ref, onMounted } from 'vue';
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

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleString('zh-CN');
};

onMounted(async () => {
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
    const leads = await client.get('/leads?limit=5');
    recentLeads.value = leads.data.items ?? [];
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
