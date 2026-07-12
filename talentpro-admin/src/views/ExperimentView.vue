<!--
  Experiment View 组件

  位于: views/ExperimentView.vue
-->
<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">{{ t('experiments.title') }}</h2>
      <el-button type="primary" size="small" @click="showCreate = true" v-permission="'experiment:create'">{{ t('experiments.createExperiment') }}</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="hover">
          <el-table :data="experiments" v-loading="loading" size="default">
            <el-table-column prop="key" :label="t('experiments.key')" width="120" />
            <el-table-column prop="name" :label="t('experiments.name')" />
            <el-table-column :label="t('experiments.trafficAllocation')" width="100">
              <template #default="{ row }">
                <span>A: {{ ((1 - (row.trafficSplit || 0.5)) * 100).toFixed(1) }}% / B: {{ ((row.trafficSplit || 0.5) * 100).toFixed(0) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="t('experiments.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('experiments.operation')" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewStats(row)">{{ t('experiments.data') }}</el-button>
                <el-button v-if="row.status === 'draft'" link type="success" size="small" @click="changeStatus(row.id, 'running')">{{ t('experiments.start') }}</el-button>
                <el-button v-if="row.status === 'running'" link type="warning" size="small" @click="changeStatus(row.id, 'paused')">{{ t('experiments.pause') }}</el-button>
                <el-button v-if="row.status !== 'ended'" link type="danger" size="small" @click="changeStatus(row.id, 'ended')">{{ t('experiments.end') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-if="selectedExp" shadow="hover" v-loading="statsLoading">
          <template #header>
            <div style="font-weight:600">{{ selectedExp.name }} — {{ t('experiments.experimentData') }}</div>
          </template>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">{{ t('experiments.variantAImpressions') }}</div>
            <div style="font-size:20px;font-weight:600">{{ stats.impressions.find(i => i.variant === 'A')?._count?.variant || 0 }}</div>
          </div>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">{{ t('experiments.variantBImpressions') }}</div>
            <div style="font-size:20px;font-weight:600">{{ stats.impressions.find(i => i.variant === 'B')?._count?.variant || 0 }}</div>
          </div>
          <el-divider />
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">{{ t('experiments.variantAConversions') }}</div>
            <div style="font-size:20px;font-weight:600;color:var(--admin-color-success)">{{ stats.conversions.find(i => i.variant === 'A')?._count?.variant || 0 }}</div>
          </div>
          <div>
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">{{ t('experiments.variantBConversions') }}</div>
            <div style="font-size:20px;font-weight:600;color:var(--admin-color-success)">{{ stats.conversions.find(i => i.variant === 'B')?._count?.variant || 0 }}</div>
          </div>
        </el-card>
        <el-card v-else shadow="hover">
          <div style="text-align:center;color:var(--admin-text-placeholder);padding:40px 0">{{ t('experiments.viewStatsHint') }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建实验弹窗 -->
    <el-dialog v-model="showCreate" :title="t('experiments.createDialog')" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('experiments.key')">
          <el-input v-model="form.key" placeholder="hero-cta-v1" />
        </el-form-item>
        <el-form-item :label="t('experiments.name')">
          <el-input v-model="form.name" placeholder="Hero CTA button copy experiment" />
        </el-form-item>
        <el-form-item :label="t('experiments.description')">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="t('experiments.bTraffic')">
          <el-slider v-model="form.trafficSplit" :min="0.05" :max="0.95" :step="0.05" show-stops />
          <div style="font-size:12px;color:var(--admin-text-placeholder)">{{ t('experiments.bTrafficHint', { pct: (form.trafficSplit * 100).toFixed(0) }) }}</div>
        </el-form-item>
        <el-form-item :label="t('experiments.aConfig')">
          <el-input v-model="variantAJson" type="textarea" :rows="3" :placeholder="t('experiments.aPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('experiments.bConfig')">
          <el-input v-model="variantBJson" type="textarea" :rows="3" :placeholder="t('experiments.bPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">{{ t('experiments.cancel') }}</el-button>
        <el-button type="primary" :loading="creating" @click="createExp">{{ t('experiments.create') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client.js';
import { ElMessage } from 'element-plus';

const { t } = useI18n();

const experiments = ref([]);
const loading = ref(false);
const showCreate = ref(false);
const creating = ref(false);
const selectedExp = ref(null);
const statsLoading = ref(false);
const stats = ref({ impressions: [], conversions: [] });

const form = reactive({ key: '', name: '', description: '', trafficSplit: 0.5, variantA: {}, variantB: {} });
const variantAJson = ref('{}');
const variantBJson = ref('{}');

const fetchExperiments = async () => {
  loading.value = true;
  try {
    const res = await client.get('/experiments');
    experiments.value = res.data ?? [];
  } catch (e) {
    ElMessage.error(t('experiments.loadFailed'));
  }
  loading.value = false;
};

const statusType = (s) => ({ draft: 'info', running: 'success', paused: 'warning', ended: 'danger' }[s] || 'info');
const statusLabel = (s) => t(`experiments.statusLabels.${s}`, s);

const changeStatus = async (id, status) => {
  try {
    await client.post(`/experiments/${id}/status`, { status });
    ElMessage.success(t('experiments.statusUpdateSuccess'));
    fetchExperiments();
  } catch (e) {
    ElMessage.error(t('experiments.operationFailed'));
  }
};

const viewStats = async (row) => {
  selectedExp.value = row;
  statsLoading.value = true;
  try {
    const res = await client.get(`/experiments/${row.id}/stats`);
    stats.value = res.data ?? { impressions: [], conversions: [] };
  } catch (e) {
    ElMessage.error(t('experiments.loadStatsFailed'));
  }
  statsLoading.value = false;
};

const createExp = async () => {
  try {
    form.variantA = JSON.parse(variantAJson.value || '{}');
    form.variantB = JSON.parse(variantBJson.value || '{}');
  } catch {
    ElMessage.error(t('experiments.jsonError'));
    return;
  }
  creating.value = true;
  try {
    await client.post('/experiments', { ...form });
    ElMessage.success(t('experiments.createSuccess'));
    showCreate.value = false;
    form.key = ''; form.name = ''; form.description = ''; form.trafficSplit = 0.5;
    variantAJson.value = '{}'; variantBJson.value = '{}';
    fetchExperiments();
  } catch (e) {
    ElMessage.error(t('experiments.createFailed'));
  }
  creating.value = false;
};

onMounted(fetchExperiments);
</script>
