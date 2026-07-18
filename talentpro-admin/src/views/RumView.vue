<template>
  <div class="rum-view">
    <div class="page-header">
      <h2>{{ $t('menu.webVitals') }}</h2>
      <el-radio-group v-model="days" size="small" @change="fetchSummary">
        <el-radio-button :value="7">7d</el-radio-button>
        <el-radio-button :value="30">30d</el-radio-button>
      </el-radio-group>
    </div>

    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="metrics.length === 0" :description="$t('common.noData')" />

    <template v-else>
      <div class="metric-cards">
        <el-card v-for="m in metrics" :key="m.metric" class="metric-card" shadow="hover">
          <div class="metric-name">{{ m.metric }}</div>
          <div class="metric-p75" :class="ratingClass(m)">{{ formatValue(m.metric, m.p75) }}</div>
          <div class="metric-meta">
            <span>p50 {{ formatValue(m.metric, m.p50) }}</span>
            <span>n={{ m.count }}</span>
          </div>
          <div class="metric-ratings">
            <el-tag v-for="(n, r) in m.ratings" :key="r" size="small" :type="tagType(String(r))">
              {{ r }} {{ n }}
            </el-tag>
          </div>
        </el-card>
      </div>

      <el-card class="pages-card" shadow="never">
        <template #header>LCP p75 Top Pages</template>
        <el-table :data="lcpPages" size="small">
          <el-table-column prop="pathname" label="Path" />
          <el-table-column prop="count" label="n" width="90" />
          <el-table-column label="p75" width="120">
            <template #default="{ row }">{{ formatValue('LCP', row.p75) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import client from '@/api/client';

interface VitalSummary {
  metric: string;
  count: number;
  p50: number;
  p75: number;
  ratings: Record<string, number>;
  pages: Array<{ pathname: string; count: number; p75: number }>;
}

const days = ref(7);
const loading = ref(false);
const metrics = ref<VitalSummary[]>([]);

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
  FCP: [1800, 3000],
};

const ratingClass = (m: VitalSummary) => {
  const [good, poor] = THRESHOLDS[m.metric] || [Infinity, Infinity];
  if (m.p75 <= good) return 'rating-good';
  if (m.p75 <= poor) return 'rating-ni';
  return 'rating-poor';
};

const tagType = (rating: string) =>
  rating === 'good' ? 'success' : rating === 'poor' ? 'danger' : 'warning';

const formatValue = (metric: string, v: number) =>
  metric === 'CLS' ? v.toFixed(3) : `${Math.round(v)}ms`;

const lcpPages = computed(() => metrics.value.find((m) => m.metric === 'LCP')?.pages || []);

const fetchSummary = async () => {
  loading.value = true;
  try {
    const res = await client.get('/analytics/web-vitals/summary', { params: { days: days.value } });
    const data = (res as { data?: VitalSummary[] }).data ?? (res as unknown as VitalSummary[]);
    metrics.value = Array.isArray(data) ? data : [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSummary);
</script>

<style scoped>
.rum-view { padding: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.metric-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
.metric-name { font-size: 13px; color: var(--el-text-color-secondary); }
.metric-p75 { font-size: 28px; font-weight: 700; margin: 4px 0; }
.rating-good { color: var(--el-color-success); }
.rating-ni { color: var(--el-color-warning); }
.rating-poor { color: var(--el-color-danger); }
.metric-meta { display: flex; gap: 12px; font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 8px; }
.metric-ratings { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
