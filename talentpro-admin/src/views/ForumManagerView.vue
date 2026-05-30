<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">论坛管理</h2>
      <el-button type="primary" size="small" @click="categoryDialogVisible = true">管理分类</el-button>
    </div>
    <el-card shadow="hover">
      <el-table :data="list.items" v-loading="list.loading" size="default">
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
            <el-button link type="danger" @click="handleDelete(row)" v-permission="'forum:delete'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="list.total"
        :page-size="list.pageSize"
        v-model:current-page="list.page"
        @current-change="list.fetch"
      />
    </el-card>

    <!-- 分类管理对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="论坛分类管理" width="560px">
      <div style="margin-bottom:12px">
        <el-button type="primary" size="small" @click="openCategoryDialog()">+ 新建分类</el-button>
      </div>
      <el-table :data="categories" v-loading="categoryLoading" size="small">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openCategoryDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 分类编辑对话框 -->
    <el-dialog v-model="categoryFormVisible" :title="isEditCategory ? '编辑分类' : '新建分类'" width="420px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" rows="2" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="categorySaving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';
import { useList } from '@/composables/useList.js';

const list = useList({
  fetchFn: (p) => client.get(`/forums/topics?page=${p.page}&pageSize=${p.pageSize}`),
});

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
    list.fetch();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

// ─── 分类管理 ───
const categoryDialogVisible = ref(false);
const categoryFormVisible = ref(false);
const categoryLoading = ref(false);
const categorySaving = ref(false);
const isEditCategory = ref(false);
const categories = ref([]);
const categoryForm = reactive({ id: '', name: '', description: '', sortOrder: 0 });

const fetchCategories = async () => {
  categoryLoading.value = true;
  try {
    const res = await client.get('/forums/categories');
    categories.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    ElMessage.error('加载分类失败');
  }
  categoryLoading.value = false;
};

const openCategoryDialog = (row = null) => {
  isEditCategory.value = !!row;
  if (row) {
    Object.assign(categoryForm, { id: row.id, name: row.name, description: row.description || '', sortOrder: row.sortOrder || 0 });
  } else {
    Object.assign(categoryForm, { id: '', name: '', description: '', sortOrder: 0 });
  }
  categoryFormVisible.value = true;
};

const saveCategory = async () => {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }
  categorySaving.value = true;
  try {
    const payload = { name: categoryForm.name, description: categoryForm.description, sortOrder: categoryForm.sortOrder };
    if (isEditCategory.value) {
      await client.patch(`/forums/categories/${categoryForm.id}`, payload);
      ElMessage.success('分类已更新');
    } else {
      await client.post('/forums/categories', payload);
      ElMessage.success('分类已创建');
    }
    categoryFormVisible.value = false;
    fetchCategories();
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  }
  categorySaving.value = false;
};

const deleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除分类 "${row.name}"？该分类下的话题将被影响。`, '提示', { type: 'warning' });
    await client.delete(`/forums/categories/${row.id}`);
    ElMessage.success('删除成功');
    fetchCategories();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(fetchCategories);
</script>
