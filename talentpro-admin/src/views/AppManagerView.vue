<template>
  <div>
    <h2 style="margin-bottom: 20px">应用管理</h2>
    <el-card shadow="hover">
      <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap">
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="handleFilterChange">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="待审核" value="PENDING_REVIEW" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="已下架" value="SUSPENDED" />
          <el-option label="已废弃" value="DEPRECATED" />
        </el-select>
        <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 140px" @change="handleFilterChange">
          <el-option v-for="c in categories" :key="c.id" :label="c.label" :value="c.id" />
        </el-select>
      </div>

      <CmsTable
        ref="tableRef"
        api-url="/admin/marketplace/apps"
        :columns="columns"
        :form-fields="formFields"
        :api-params="apiParams"
        ai-assist="product"
      >
        <template #column-status="{ row }">
          <el-tag :type="statusType(row.status)">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
        <template #column-pricingModel="{ row }">
          <el-tag size="small">{{ pricingLabel(row.pricingModel) }}</el-tag>
        </template>
        <template #column-featured="{ row }">
          <el-tag :type="row.featured ? 'success' : 'info'" size="small">
            {{ row.featured ? '是' : '否' }}
          </el-tag>
        </template>
        <template #column-ratingAvg="{ row }">
          <span style="color: #f59e0b; font-weight: 600">★ {{ row.ratingAvg || '-' }}</span>
        </template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openStatusDialog(row)">审核</el-button>
          <el-button link :type="row.featured ? 'warning' : 'success'" @click="toggleFeature(row)">
            {{ row.featured ? '取消推荐' : '设为推荐' }}
          </el-button>
        </template>
        <template #form-field-status="{ form }">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已下架" value="SUSPENDED" />
            <el-option label="已废弃" value="DEPRECATED" />
          </el-select>
        </template>
        <template #form-field-pricingModel="{ form }">
          <el-select v-model="form.pricingModel" style="width: 100%">
            <el-option label="免费" value="FREE" />
            <el-option label="一次性" value="ONE_TIME" />
            <el-option label="订阅制" value="SUBSCRIPTION" />
            <el-option label="按量计费" value="USAGE_BASED" />
            <el-option label="免费增值" value="FREEMIUM" />
          </el-select>
        </template>
        <template #form-field-featured="{ form }">
          <el-switch v-model="form.featured" />
        </template>
      </CmsTable>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="应用审核" width="500px" destroy-on-close>
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="应用名称">
          <span>{{ statusForm.name }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="statusType(statusForm.currentStatus)">{{ statusLabel(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已下架" value="SUSPENDED" />
            <el-option label="已废弃" value="DEPRECATED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusSaving" @click="handleStatusSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/CmsTable.vue';
import client from '@/api/client.js';

const tableRef = ref(null);
const filterStatus = ref('');
const filterCategory = ref('');

const apiParams = ref({});

const categories = [
  { id: 'recruitment', label: '招聘与人才获取' },
  { id: 'compensation', label: '薪酬与福利' },
  { id: 'performance', label: '绩效与目标' },
  { id: 'learning', label: '学习与发展' },
  { id: 'experience', label: '员工体验' },
  { id: 'compliance', label: '合规与安全' },
  { id: 'ai', label: 'AI 与自动化' },
  { id: 'analytics', label: '数据与分析' },
];

const columns = [
  { prop: 'name', label: '应用名称', minWidth: 160 },
  { prop: 'slug', label: 'Slug', width: 140 },
  { prop: 'category', label: '分类', width: 120, formatter: (row) => categoryLabel(row.category?.slug || row.category) },
  { prop: 'vendor', label: '开发商', width: 120, formatter: (row) => row.vendor?.name || row.vendor },
  { prop: 'pricingModel', label: '定价', width: 90 },
  { prop: 'status', label: '状态', width: 90 },
  { prop: 'featured', label: '精选', width: 80 },
  { prop: 'ratingAvg', label: '评分', width: 80 },
  { prop: 'installCount', label: '安装量', width: 90 },
  { prop: 'sortOrder', label: '排序', width: 80 },
];

const formFields = [
  { prop: 'name', label: '应用名称', type: 'input' },
  { prop: 'slug', label: 'Slug', type: 'input' },
  { prop: 'tagline', label: '标语', type: 'input' },
  { prop: 'description', label: '描述', type: 'textarea', rows: 4 },
  { prop: 'status', label: '状态', type: 'input' },
  { prop: 'pricingModel', label: '定价模式', type: 'input' },
  { prop: 'featured', label: '精选', type: 'switch' },
  { prop: 'sortOrder', label: '排序', type: 'number' },
];

const statusDialogVisible = ref(false);
const statusSaving = ref(false);
const statusForm = ref({ id: '', name: '', currentStatus: '', status: '' });

const statusType = (s) => {
  const map = {
    DRAFT: 'info',
    PENDING_REVIEW: 'warning',
    APPROVED: 'success',
    PUBLISHED: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'danger',
    DEPRECATED: 'info',
  };
  return map[s] || 'info';
};

const statusLabel = (s) => {
  const map = {
    DRAFT: '草稿',
    PENDING_REVIEW: '待审核',
    APPROVED: '已通过',
    PUBLISHED: '已发布',
    REJECTED: '已拒绝',
    SUSPENDED: '已下架',
    DEPRECATED: '已废弃',
  };
  return map[s] || s;
};

const pricingLabel = (p) => {
  const map = {
    FREE: '免费',
    ONE_TIME: '一次性',
    SUBSCRIPTION: '订阅',
    USAGE_BASED: '按量',
    FREEMIUM: '增值',
  };
  return map[p] || p;
};

const categoryLabel = (c) => {
  const cat = categories.find((x) => x.id === c);
  return cat?.label || c;
};

const handleFilterChange = () => {
  apiParams.value = {};
  if (filterStatus.value) apiParams.value.status = filterStatus.value;
  if (filterCategory.value) apiParams.value.category = filterCategory.value;
  if (tableRef.value) {
    tableRef.value.setParams(apiParams.value);
    tableRef.value.refresh();
  }
};

const openStatusDialog = (row) => {
  statusForm.value = {
    id: row.id,
    name: row.name,
    currentStatus: row.status,
    status: row.status,
  };
  statusDialogVisible.value = true;
};

const handleStatusSave = async () => {
  statusSaving.value = true;
  try {
    await client.patch(`/admin/marketplace/apps/${statusForm.value.id}/status`, {
      status: statusForm.value.status,
    });
    ElMessage.success('状态更新成功');
    statusDialogVisible.value = false;
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '更新失败');
  } finally {
    statusSaving.value = false;
  }
};

const toggleFeature = async (row) => {
  try {
    await client.post(`/admin/marketplace/apps/${row.id}/feature`, {
      featured: !row.featured,
    });
    ElMessage.success(!row.featured ? '已设为推荐' : '已取消推荐');
    if (tableRef.value) tableRef.value.refresh();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '操作失败');
  }
};
</script>
