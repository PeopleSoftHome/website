<template>
  <div>
    <h2 style="margin-bottom:20px">评论审核</h2>

    <el-card shadow="hover">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待审核" name="PENDING">
          <el-alert
            v-if="activeTab === 'PENDING'"
            title="新提交的评论需要审核后才能展示"
            type="info"
            :closable="false"
            style="margin-bottom:16px"
          />
        </el-tab-pane>
        <el-tab-pane label="已通过" name="APPROVED" />
        <el-tab-pane label="已拒绝" name="REJECTED" />
      </el-tabs>

      <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center">
        <el-button
          type="primary"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchApprove"
        >
          批量通过 ({{ selectedIds.length }})
        </el-button>
        <el-button
          type="danger"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchReject"
        >
          批量拒绝 ({{ selectedIds.length }})
        </el-button>
        <el-button
          type="danger"
          plain
          size="small"
          :disabled="selectedIds.length === 0"
          @click="batchDelete"
        >
          批量删除
        </el-button>
      </div>

      <el-table
        :data="comments"
        v-loading="loading"
        size="default"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="评论内容" min-width="280">
          <template #default="{ row }">
            <div>
              <p style="margin:0 0 4px;line-height:1.5">{{ row.content }}</p>
              <el-tag v-if="row.parent" size="small" type="info">回复 @{{ row.parent.author?.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <el-avatar :size="28" :src="row.author?.avatar">{{ row.author?.name?.[0] }}</el-avatar>
              <span>{{ row.author?.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="entityType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.entityType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AI审核" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.aiRiskScore != null" :type="row.aiRiskScore > 0.5 ? 'danger' : row.aiRiskScore > 0.3 ? 'warning' : 'success'" size="small">
              {{ (row.aiRiskScore * 100).toFixed(0) }}%
            </el-tag>
            <div v-if="row.aiFlags?.length" style="margin-top:4px">
              <el-tag v-for="flag in row.aiFlags" :key="flag" size="small" type="info" style="margin-right:4px">{{ flag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'APPROVED'" link type="success" size="small" @click="moderate(row.id, 'APPROVED')">通过</el-button>
            <el-button v-if="row.status !== 'REJECTED'" link type="warning" size="small" @click="moderate(row.id, 'REJECTED')">拒绝</el-button>
            <el-button link type="danger" size="small" @click="remove(row.id)">删除</el-button>
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

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, onMounted, watch } from 'vue';
import client from '@/api/client.js';
import { ElMessage, ElMessageBox } from 'element-plus';

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
    ElMessage.error('加载失败');
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
    ElMessage.success(status === 'APPROVED' ? '已通过' : '已拒绝');
    fetchComments();
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const batchApprove = async () => {
  try {
    await client.post('/blogs/comments/batch-moderate', {
      ids: selectedIds.value,
      status: 'APPROVED',
    });
    ElMessage.success(`已批量通过 ${selectedIds.value.length} 条评论`);
    selectedIds.value = [];
    fetchComments();
  } catch (e) {
    ElMessage.error('批量操作失败');
  }
};

const batchReject = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝 ${selectedIds.value.length} 条评论吗？`,
      '确认拒绝',
      { confirmButtonText: '拒绝', cancelButtonText: '取消', type: 'warning' },
    );
    await client.post('/blogs/comments/batch-moderate', {
      ids: selectedIds.value,
      status: 'REJECTED',
    });
    ElMessage.success(`已批量拒绝 ${selectedIds.value.length} 条评论`);
    selectedIds.value = [];
    fetchComments();
  } catch {
    // 取消
  }
};

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${selectedIds.value.length} 条评论吗？此操作不可恢复。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'danger' },
    );
    for (const id of selectedIds.value) {
      await client.delete(`/blogs/comments/${id}`);
    }
    ElMessage.success(`已删除 ${selectedIds.value.length} 条评论`);
    selectedIds.value = [];
    fetchComments();
  } catch {
    // 取消
  }
};

const remove = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'danger',
    });
    await client.delete(`/blogs/comments/${id}`);
    ElMessage.success('已删除');
    fetchComments();
  } catch {
    // 取消
  }
};

watch(activeTab, () => {
  page.value = 1;
  fetchComments();
});

onMounted(fetchComments);
</script>
