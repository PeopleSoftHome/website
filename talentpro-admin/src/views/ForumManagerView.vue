<!--
  Forum Manager View 组件

  位于: views/ForumManagerView.vue
-->
<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">{{ t('forums.title') }}</h2>
      <el-button type="primary" size="small" @click="categoryDialogVisible = true">{{ t('forums.manageCategories') }}</el-button>
    </div>
    <el-card shadow="hover">
      <el-table :data="list.items" v-loading="list.loading" size="default">
        <el-table-column prop="title" :label="t('forums.titleCol')" />
        <el-table-column prop="category.name" :label="t('forums.category')" width="120" />
        <el-table-column prop="author.name" :label="t('forums.author')" width="120" />
        <el-table-column :label="t('forums.pinned')" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.isPinned" @change="togglePin(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="t('forums.locked')" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.isLocked" @change="toggleLock(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('forums.createdAt')" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('forums.operation')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row)" v-permission="'forum:delete'">{{ t('forums.delete') }}</el-button>
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
    <el-dialog v-model="categoryDialogVisible" :title="t('forums.categoryManagement')" width="560px">
      <div style="margin-bottom:12px">
        <el-button type="primary" size="small" @click="openCategoryDialog()">+ {{ t('forums.createCategory') }}</el-button>
      </div>
      <el-table :data="categories" v-loading="categoryLoading" size="small">
        <el-table-column prop="name" :label="t('forums.name')" />
        <el-table-column prop="description" :label="t('forums.description')" show-overflow-tooltip />
        <el-table-column prop="sortOrder" :label="t('forums.sortOrder')" width="80" />
        <el-table-column :label="t('forums.operation')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openCategoryDialog(row)">{{ t('common.edit') }}</el-button>
            <el-button link type="danger" size="small" @click="deleteCategory(row)">{{ t('forums.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 分类编辑对话框 -->
    <el-dialog v-model="categoryFormVisible" :title="isEditCategory ? t('forums.editCategory') : t('forums.createCategoryDialog')" width="420px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item :label="t('forums.name')">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item :label="t('forums.description')">
          <el-input v-model="categoryForm.description" type="textarea" rows="2" />
        </el-form-item>
        <el-form-item :label="t('forums.sortOrder')">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFormVisible = false">{{ t('forums.cancel') }}</el-button>
        <el-button type="primary" @click="saveCategory" :loading="categorySaving">{{ t('forums.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client.js';
import { useList } from '@/composables/useList.js';

const { t } = useI18n();

const list = useList({
  fetchFn: (p) => client.get(`/forums/topics?page=${p.page}&pageSize=${p.pageSize}`),
});

const togglePin = async (row) => {
  try {
    await client.patch(`/forums/topics/${row.id}/pin`, { isPinned: row.isPinned });
    ElMessage.success(row.isPinned ? t('forums.pinnedSuccess') : t('forums.unpinnedSuccess'));
  } catch (e) {
    ElMessage.error(t('forums.operationFailed'));
    row.isPinned = !row.isPinned;
  }
};

const toggleLock = async (row) => {
  try {
    await client.patch(`/forums/topics/${row.id}/lock`, { isLocked: row.isLocked });
    ElMessage.success(row.isLocked ? t('forums.lockedSuccess') : t('forums.unlockedSuccess'));
  } catch (e) {
    ElMessage.error(t('forums.operationFailed'));
    row.isLocked = !row.isLocked;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('forums.deleteTopicConfirm'), t('common.tip'), { type: 'warning' });
    await client.delete(`/forums/topics/${row.id}`);
    ElMessage.success(t('forums.deleteTopicSuccess'));
    list.fetch();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('forums.deleteTopicFailed'));
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
    ElMessage.error(t('forums.loadCategoriesFailed'));
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
    ElMessage.warning(t('forums.categoryNameRequired'));
    return;
  }
  categorySaving.value = true;
  try {
    const payload = { name: categoryForm.name, description: categoryForm.description, sortOrder: categoryForm.sortOrder };
    if (isEditCategory.value) {
      await client.patch(`/forums/categories/${categoryForm.id}`, payload);
      ElMessage.success(t('forums.categoryUpdateSuccess'));
    } else {
      await client.post('/forums/categories', payload);
      ElMessage.success(t('forums.categoryCreateSuccess'));
    }
    categoryFormVisible.value = false;
    fetchCategories();
  } catch (e) {
    ElMessage.error(e.message || t('forums.categorySaveFailed'));
  }
  categorySaving.value = false;
};

const deleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(t('forums.deleteCategoryConfirm', { name: row.name }), t('common.tip'), { type: 'warning' });
    await client.delete(`/forums/categories/${row.id}`);
    ElMessage.success(t('forums.deleteCategorySuccess'));
    fetchCategories();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('forums.deleteCategoryFailed'));
  }
};

onMounted(fetchCategories);
</script>
