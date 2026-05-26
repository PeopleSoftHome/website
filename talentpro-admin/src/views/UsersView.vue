<template>
  <div>
    <h2 style="margin-bottom:20px">用户管理</h2>
    <el-card shadow="hover">
      <el-table :data="users" v-loading="loading" size="default">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role.name" label="角色" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.role?.name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="total"
        :page-size="20"
        v-model:current-page="page"
        @current-change="fetchUsers"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import client from '@/api/client.js';

const users = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/users?page=${page.value}&limit=20`);
    users.value = res.data.items ?? [];
    total.value = res.data.total ?? 0;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

onMounted(fetchUsers);
</script>
