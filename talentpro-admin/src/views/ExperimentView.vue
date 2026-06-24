<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">A/B 测试管理</h2>
      <el-button type="primary" size="small" @click="showCreate = true" v-permission="'experiment:create'">新建实验</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="hover">
          <el-table :data="experiments" v-loading="loading" size="default">
            <el-table-column prop="key" label="标识" width="120" />
            <el-table-column prop="name" label="名称" />
            <el-table-column label="流量分配" width="100">
              <template #default="{ row }">
                <span>A: {{ (1 - (row.trafficSplit || 0.5)).toFixed(1) }}% / B: {{ ((row.trafficSplit || 0.5) * 100).toFixed(0) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewStats(row)">数据</el-button>
                <el-button v-if="row.status === 'draft'" link type="success" size="small" @click="changeStatus(row.id, 'running')">启动</el-button>
                <el-button v-if="row.status === 'running'" link type="warning" size="small" @click="changeStatus(row.id, 'paused')">暂停</el-button>
                <el-button v-if="row.status !== 'ended'" link type="danger" size="small" @click="changeStatus(row.id, 'ended')">结束</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-if="selectedExp" shadow="hover" v-loading="statsLoading">
          <template #header>
            <div style="font-weight:600">{{ selectedExp.name }} — 实验数据</div>
          </template>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">Variant A 曝光</div>
            <div style="font-size:20px;font-weight:600">{{ stats.impressions.find(i => i.variant === 'A')?._count?.variant || 0 }}</div>
          </div>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">Variant B 曝光</div>
            <div style="font-size:20px;font-weight:600">{{ stats.impressions.find(i => i.variant === 'B')?._count?.variant || 0 }}</div>
          </div>
          <el-divider />
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">Variant A 转化</div>
            <div style="font-size:20px;font-weight:600;color:var(--admin-color-success)">{{ stats.conversions.find(i => i.variant === 'A')?._count?.variant || 0 }}</div>
          </div>
          <div>
            <div style="font-size:12px;color:var(--admin-text-placeholder);margin-bottom:4px">Variant B 转化</div>
            <div style="font-size:20px;font-weight:600;color:var(--admin-color-success)">{{ stats.conversions.find(i => i.variant === 'B')?._count?.variant || 0 }}</div>
          </div>
        </el-card>
        <el-card v-else shadow="hover">
          <div style="text-align:center;color:var(--admin-text-placeholder);padding:40px 0">点击实验行的「数据」查看转化统计</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建实验弹窗 -->
    <el-dialog v-model="showCreate" title="新建 A/B 实验" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标识">
          <el-input v-model="form.key" placeholder="hero-cta-v1" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="Hero CTA 按钮文案实验" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="B组流量">
          <el-slider v-model="form.trafficSplit" :min="0.05" :max="0.95" :step="0.05" show-stops />
          <div style="font-size:12px;color:var(--admin-text-placeholder)">B 组占 {{ (form.trafficSplit * 100).toFixed(0) }}%</div>
        </el-form-item>
        <el-form-item label="A组配置">
          <el-input v-model="variantAJson" type="textarea" :rows="3" placeholder='{ "name": "对照组", "ctaText": "预约演示" }' />
        </el-form-item>
        <el-form-item label="B组配置">
          <el-input v-model="variantBJson" type="textarea" :rows="3" placeholder='{ "name": "实验组", "ctaText": "立即体验" }' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="createExp">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import client from '@/api/client.js';
import { ElMessage } from 'element-plus';

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
    ElMessage.error('加载实验列表失败');
  }
  loading.value = false;
};

const statusType = (s) => ({ draft: 'info', running: 'success', paused: 'warning', ended: 'danger' }[s] || 'info');
const statusLabel = (s) => ({ draft: '草稿', running: '运行中', paused: '暂停', ended: '已结束' }[s] || s);

const changeStatus = async (id, status) => {
  try {
    await client.post(`/experiments/${id}/status`, { status });
    ElMessage.success('状态更新成功');
    fetchExperiments();
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const viewStats = async (row) => {
  selectedExp.value = row;
  statsLoading.value = true;
  try {
    const res = await client.get(`/experiments/${row.id}/stats`);
    stats.value = res.data ?? { impressions: [], conversions: [] };
  } catch (e) {
    ElMessage.error('加载统计数据失败');
  }
  statsLoading.value = false;
};

const createExp = async () => {
  try {
    form.variantA = JSON.parse(variantAJson.value || '{}');
    form.variantB = JSON.parse(variantBJson.value || '{}');
  } catch {
    ElMessage.error('JSON 格式错误');
    return;
  }
  creating.value = true;
  try {
    await client.post('/experiments', { ...form });
    ElMessage.success('创建成功');
    showCreate.value = false;
    form.key = ''; form.name = ''; form.description = ''; form.trafficSplit = 0.5;
    variantAJson.value = '{}'; variantBJson.value = '{}';
    fetchExperiments();
  } catch (e) {
    ElMessage.error('创建失败');
  }
  creating.value = false;
};

onMounted(fetchExperiments);
</script>
