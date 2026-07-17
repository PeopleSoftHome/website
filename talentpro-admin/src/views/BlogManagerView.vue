<!--
  Blog Manager View 组件

  位于: views/BlogManagerView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('blogs.title') }}</h2>
    <el-card shadow="hover">
      <div style="margin-bottom:16px">
        <el-button type="primary" @click="openDialog()" v-permission="'blog:create'">+ {{ t('blogs.createArticle') }}</el-button>
      </div>
      <el-table :data="list.items" v-loading="list.loading" size="default">
        <el-table-column prop="title" :label="t('blogs.titleCol')" />
        <el-table-column prop="category.name" :label="t('blogs.category')" width="120" />
        <el-table-column prop="status" :label="t('blogs.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'">{{ t(`blogs.statusOptions.${row.status}`, row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('blogs.createdAt')" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('blogs.operation')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)" v-permission="'blog:update'">{{ t('blogs.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-permission="'blog:delete'">{{ t('blogs.delete') }}</el-button>
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

    <!-- 编辑/新建弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? t('blogs.editArticle') : t('blogs.createArticleDialog')" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('blogs.titleCol')">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="t('blogs.slug')">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item :label="t('blogs.category')">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('blogs.excerpt')">
          <el-input v-model="form.excerpt" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item :label="t('blogs.coverImage')">
          <ImageUpload v-model="form.coverImage" />
        </el-form-item>
        <el-form-item :label="t('blogs.content')">
          <RichEditor v-model="form.content" />
        </el-form-item>
        <el-form-item :label="t('blogs.status')">
          <el-select v-model="form.status" style="width:100%">
            <el-option :label="t('blogs.statusOptions.DRAFT')" value="DRAFT" />
            <el-option :label="t('blogs.statusOptions.PUBLISHED')" value="PUBLISHED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <AiAssistButton
          type="blog"
          :title="form.title"
          :content="form.content || form.excerpt"
          @result="(p) => { aiPayload.value = p; aiVisible.value = true; }"
        />
        <el-button @click="dialogVisible = false">{{ t('blogs.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">{{ t('blogs.save') }}</el-button>
      </template>
    </el-dialog>

    <AiAssistDialog
      v-model:visible="aiVisible"
      type="blog"
      :title="aiPayload.title"
      :content="aiPayload.content"
      @apply="(r) => applyAiResult(r, form)"
    />
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

onMounted(() => {
  fetchCategories();
});
import { ElMessage, ElMessageBox } from 'element-plus';
import client from '@/api/client';
import RichEditor from '@/components/ui/RichEditor.vue';
import ImageUpload from '@/components/ui/ImageUpload.vue';
import { useList } from '@/composables/useList';
import AiAssistButton from '@/components/ai/AiAssistButton.vue';
import AiAssistDialog from '@/components/ai/AiAssistDialog.vue';

const aiVisible = ref(false);
const aiPayload = ref({ type: 'blog', title: '', content: '' });

const list = useList({
  fetchFn: (p) => client.get(`/blogs/posts?page=${p.page}&pageSize=${p.pageSize}`),
});

const categories = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const form = ref({ title: '', slug: '', categoryId: '', excerpt: '', coverImage: '', content: '', status: 'DRAFT' });

const fetchCategories = async () => {
  try {
    const res = await client.get('/blogs/categories');
    categories.value = res.data || [];
  } catch (e) {
    if (import.meta.env.DEV) console.error(e);
  }
};

const openDialog = (row = null) => {
  isEdit.value = !!row;
  if (row) {
    form.value = { ...row, categoryId: row.category?.id };
  } else {
    form.value = { title: '', slug: '', categoryId: '', excerpt: '', coverImage: '', content: '', status: 'DRAFT' };
  }
  dialogVisible.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    if (isEdit.value) {
      await client.patch(`/blogs/posts/${form.value.id}`, form.value);
      ElMessage.success(t('blogs.updateSuccess'));
    } else {
      await client.post('/blogs/posts', { ...form.value, authorId: 'system' });
      ElMessage.success(t('blogs.createSuccess'));
    }
    dialogVisible.value = false;
    list.fetch();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('blogs.saveFailed'));
  }
  saving.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('blogs.deleteConfirm'), t('blogs.deleteTip'), { type: 'warning' });
    await client.delete(`/blogs/posts/${row.id}`);
    ElMessage.success(t('blogs.deleteSuccess'));
    list.fetch();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(t('blogs.deleteFailed'));
  }
};

const applyAiResult = ({ action, result }, target) => {
  if (result.title) target.title = result.title;
  if (result.summary) target.excerpt = result.summary;
  if (result.description && action === 'seo') {
    target.excerpt = result.description;
  }
  if (result.content) target.content = result.content;
  if (result.translation) target.content = result.translation;
  if (result.keywords && action === 'seo') {
    // 博客模型无 keywords 字段，可追加到内容或摘要
    target.excerpt = `${result.keywords.join(' / ')}
${target.excerpt || ''}`.trim();
  }
  ElMessage.success(t('blogs.applied'));
};
</script>
