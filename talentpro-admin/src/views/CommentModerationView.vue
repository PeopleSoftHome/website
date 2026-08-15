<!--
  Comment Moderation View 组件

  位于: views/CommentModerationView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('commentModeration.title') }}</h2>

    <el-card shadow="hover">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="t('commentModeration.tabPending')" name="PENDING">
          <el-alert
            v-if="activeTab === 'PENDING'"
            :title="t('commentModeration.pendingAlert')"
            type="info"
            :closable="false"
            style="margin-bottom:16px"
          />
        </el-tab-pane>
        <el-tab-pane :label="t('commentModeration.tabApproved')" name="APPROVED" />
        <el-tab-pane :label="t('commentModeration.tabRejected')" name="REJECTED" />
      </el-tabs>

      <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
        <el-button
          type="primary"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchApprove"
        >
          {{ t('commentModeration.batchApprove', { count: selectedIds.length }) }}
        </el-button>
        <el-button
          type="danger"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchReject"
        >
          {{ t('commentModeration.batchReject', { count: selectedIds.length }) }}
        </el-button>
        <el-button
          type="danger"
          plain
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchDelete"
        >
          {{ t('commentModeration.batchDelete') }}
        </el-button>
      </div>

      <el-table
        :data="comments"
        v-loading="loading"
        size="default"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column :label="t('commentModeration.commentContent')" min-width="280">
          <template #default="{ row }">
            <div>
              <p style="margin:0 0 4px;line-height:1.5">{{ row.content }}</p>
              <el-tag v-if="row.parent" size="small" type="info">{{ t('commentModeration.replyTo', { name: row.parent.author?.name }) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('commentModeration.author')" width="120">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <el-avatar :size="28" :src="row.author?.avatar">{{ row.author?.name?.[0] }}</el-avatar>
              <span>{{ row.author?.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="entityType" :label="t('commentModeration.type')" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.entityType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('commentModeration.aiReview')" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.aiRiskScore != null" :type="row.aiRiskScore > 0.5 ? 'danger' : row.aiRiskScore > 0.3 ? 'warning' : 'success'" size="small">
              {{ (row.aiRiskScore * 100).toFixed(0) }}%
            </el-tag>
            <div v-if="row.aiFlags?.length" style="margin-top:4px">
              <el-tag v-for="flag in row.aiFlags" :key="flag" size="small" type="info" style="margin-right:4px">{{ flag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('commentModeration.submitTime')" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('commentModeration.operation')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'APPROVED'" link type="success" size="small" @click="moderate(row.id, 'APPROVED')">{{ t('commentModeration.approve') }}</el-button>
            <el-button v-if="row.status !== 'REJECTED'" link type="warning" size="small" @click="moderate(row.id, 'REJECTED')">{{ t('commentModeration.reject') }}</el-button>
            <el-button link type="danger" size="small" @click="remove(row.id)">{{ t('commentModeration.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="fetchComments"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { formatDate } from '@/utils/formatDate';
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();

const activeTab = ref('PENDING');
const comments = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const selectedIds = ref([]);


const fetchComments = async () => {
  loading.value = true;
  try {
    const res = await client.get(
      `/blogs/admin/comments?status=${activeTab.value}&page=${page.value}&pageSize=${pageSize.value}`,
    );
    comments.value = res.data || [];
    total.value = res.meta?.total || 0;
  } catch (e) {
    ElMessage.error(t('commentModeration.loadFailed'));
  }
  loading.value = false;
};

const handleTabChange = () => {
  page.value = 1;
  selectedIds.value = [];
  fetchComments();
};

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
};

const moderate = async (id, status) => {
  try {
    await client.patch(`/blogs/comments/${id}/moderate`, { status });
    ElMessage.success(status === 'APPROVED' ? t('commentModeration.approved') : t('commentModeration.rejected'));
    fetchComments();
  } catch (e) {
    ElMessage.error(t('commentModeration.operationFailed'));
  }
};

const batchApprove = async () => {
  try {
    await client.post('/blogs/comments/batch-moderate', {
      ids: selectedIds.value,
      status: 'APPROVED',
    });
    ElMessage.success(t('commentModeration.batchApproveSuccess', { count: selectedIds.value.length }));
    selectedIds.value = [];
    fetchComments();
  } catch (e) {
    ElMessage.error(t('commentModeration.operationFailed'));
  }
};

const batchReject = async () => {
  try {
    await ElMessageBox.confirm(
      t('commentModeration.batchRejectConfirm', { count: selectedIds.value.length }),
      t('commentModeration.confirmReject'),
      { confirmButtonText: t('commentModeration.confirmButtonReject'), cancelButtonText: t('commentModeration.cancel'), type: 'warning' },
    );
    await client.post('/blogs/comments/batch-moderate', {
      ids: selectedIds.value,
      status: 'REJECTED',
    });
    ElMessage.success(t('commentModeration.batchRejectSuccess', { count: selectedIds.value.length }));
    selectedIds.value = [];
    fetchComments();
  } catch {
    // cancel
  }
};

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t('commentModeration.batchDeleteConfirm', { count: selectedIds.value.length }),
      t('commentModeration.confirmDelete'),
      { confirmButtonText: t('commentModeration.confirmButtonDelete'), cancelButtonText: t('commentModeration.cancel'), type: 'danger' },
    );
    for (const id of selectedIds.value) {
      await client.delete(`/blogs/comments/${id}`);
    }
    ElMessage.success(t('commentModeration.batchDeleteSuccess', { count: selectedIds.value.length }));
    selectedIds.value = [];
    fetchComments();
  } catch {
    // cancel
  }
};

const remove = async (id) => {
  try {
    await ElMessageBox.confirm(t('commentModeration.deleteConfirm'), t('commentModeration.confirmDelete'), {
      confirmButtonText: t('commentModeration.confirmButtonDelete'),
      cancelButtonText: t('commentModeration.cancel'),
      type: 'danger',
    });
    await client.delete(`/blogs/comments/${id}`);
    ElMessage.success(t('commentModeration.deleted'));
    fetchComments();
  } catch {
    // cancel
  }
};

watch(activeTab, () => {
  page.value = 1;
  fetchComments();
});

onMounted(fetchComments);
</script>
