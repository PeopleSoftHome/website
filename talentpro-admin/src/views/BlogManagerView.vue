<template>
  <div>
    <h2 style="margin-bottom:20px">博客管理</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()">+ 新建文章</el-button>
      </div>
      <el-table :data="posts" v-loading="loading" size="default">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category.name" label="分类" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
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
        @current-change="fetchPosts"
      />
    </el-card>

    <!-- 编辑/新建弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑文章' : '新建文章'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.excerpt" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';

const posts = ref([]);
const categories = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const form = ref({ title: '', slug: '', categoryId: '', excerpt: '', content: '', status: 'DRAFT' });

const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await client.get(`/blogs/posts?page=${page.value}&limit=20`);
    posts.value = res.data?.items || [];
    total.value = res.data?.total || 0;
  } catch (e) { console.error(e); }
  loading.value = false;
};

const fetchCategories = async () => {
  try {
    const res = await client.get('/blogs/categories');
    categories.value = res.data || [];
  } catch (e) { console.error(e); }
};

const openDialog = (row = null) => {
  isEdit.value = !!row;
  if (row) {
    form.value = { ...row, categoryId: row.category?.id };
  } else {
    form.value = { title: '', slug: '', categoryId: '', excerpt: '', content: '', status: 'DRAFT' };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    if (isEdit.value) {
      await client.patch(`/blogs/posts/${form.value.id}`, form.value);
      ElMessage.success('更新成功');
    } else {
      await client.post('/blogs/posts', { ...form.value, authorId: 'system' });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    fetchPosts();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '保存失败');
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该文章？', '提示', { type: 'warning' });
    await client.delete(`/blogs/posts/${row.id}`);
    ElMessage.success('删除成功');
    fetchPosts();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-';

onMounted(() => {
  fetchCategories();
  fetchPosts();
});
</script>
