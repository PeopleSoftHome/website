<template>
  <div>
    <h2 style="margin-bottom:20px">论坛管理</h2>
    <el-card shadow="hover">
      <el-table :data="topics" v-loading="loading" size="default">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category.name" label="分类" width="120" />
        <el-table-column prop="author.name" label="作者" width="120" />
        <el-table-column label="置顶" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.isPinned" @change="togglePin(row)" />
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.isLocked" @change="toggleLock(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="20"
        v-model:current-page="page"
        @current-change="fetchTopics"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';

const topics = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

const fetchTopics = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/forums/topics?page=${page.value}&limit=20`);
    topics.value = res.data?.items || [];
    total.value = res.data?.total || 0;
  } catch (e) { console.error(e); }
  loading.value = false;
};

const togglePin = async (row) => {
  try {
    await client.patch(`/forums/topics/${row.id}/pin`, { isPinned: row.isPinned });
    ElMessage.success(row.isPinned ? '已置顶' : '已取消置顶');
  } catch (e) {
    ElMessage.error('操作失败');
    row.isPinned = !row.isPinned;
  }
};

const toggleLock = async (row) => {
  try {
    await client.patch(`/forums/topics/${row.id}/lock`, { isLocked: row.isLocked });
    ElMessage.success(row.isLocked ? '已锁定' : '已解锁');
  } catch (e) {
    ElMessage.error('操作失败');
    row.isLocked = !row.isLocked;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该话题？', '提示', { type: 'warning' });
    await client.delete(`/forums/topics/${row.id}`);
    ElMessage.success('删除成功');
    fetchTopics();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';

onMounted(fetchTopics);
</script>
