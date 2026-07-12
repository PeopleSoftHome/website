<!--
  Media View 组件

  位于: views/MediaView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('media.title') }}</h2>

    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="16">
        <el-upload
          ref="uploadRef"
          drag
          action="/api/v1/medias/upload"
          :with-credentials="true"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :show-file-list="false"
          accept="image/*,video/mp4,application/pdf"
        >
          <el-icon :size="48" color="var(--admin-text-secondary)"><Upload /></el-icon>
          <div style="margin-top: 8px; color: var(--admin-text-secondary)">
            {{ t('media.dragUpload') }} <em style="color: var(--admin-color-primary)">{{ t('media.clickUpload') }}</em>
          </div>
          <template #tip>
            <div style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 8px">
              {{ t('media.uploadTip') }}
            </div>
          </template>
        </el-upload>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>{{ t('media.storageStats') }}</span></template>
          <div v-if="stats" style="display: flex; flex-direction: column; gap: 12px">
            <div style="display: flex; justify-content: space-between">
              <span style="color: var(--admin-text-secondary)">{{ t('media.totalFiles') }}</span>
              <span style="font-weight: 600">{{ stats.total }}</span>
            </div>
            <div
              v-for="item in stats.byType"
              :key="item.mimeType"
              style="display: flex; justify-content: space-between"
            >
              <span style="color: var(--admin-text-secondary)">{{ item.mimeType }}</span>
              <span>{{ item._count.mimeType }} {{ t('media.count') }}</span>
            </div>
          </div>
          <el-skeleton v-else :rows="3" animated />
        </el-card>
      </el-col>
    </el-row>

    <CmsTable
      ref="tableRef"
      api-url="/medias"
      :columns="columns"
      :form-fields="formFields"
      :rules="rules"

    >
      <template #column-url="{ row }">
        <template v-if="row.mimeType?.startsWith('image')">
          <Picture
            :src="row.thumbUrl || row.url"
            :webp-src="row.webpUrl"
            :alt="row.alt || row.originalName"
            img-class="media-preview"
            img-style="width:60px;height:60px;border-radius:4px;object-fit:cover"
          />
        </template>
        <el-tag v-else size="small">{{ row.mimeType }}</el-tag>
      </template>
      <template #column-size="{ row }">
        {{ formatSize(row.size) }}
      </template>
    </CmsTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/ui/CmsTable.vue';
import Picture from '@/components/ui/Picture.vue';
import client from '@/api/client.js';

const { t } = useI18n();

const uploadRef = ref(null);
const tableRef = ref(null);
const stats = ref(null);


const columns = [
  { prop: 'url', label: t('media.preview'), width: 100 },
  { prop: 'originalName', label: t('media.fileName'), minWidth: 200 },
  { prop: 'filename', label: t('media.storageName'), width: 180 },
  { prop: 'mimeType', label: t('media.type'), width: 120 },
  { prop: 'size', label: t('media.size'), width: 100 },
  { prop: 'width', label: t('media.dimension'), width: 100, formatter: (row) => row.width ? `${row.width}x${row.height}` : '-' },
  { prop: 'alt', label: t('media.altText'), width: 150 },
  { prop: 'createdAt', label: t('media.uploadTime'), width: 160 },
];

const formFields = [
  { prop: 'originalName', label: t('media.fileName'), type: 'input' },
  { prop: 'alt', label: t('media.altText'), type: 'input' },
];

const rules = {
  originalName: [{ required: true, message: t('media.fileNameRequired'), trigger: 'blur' }],
};

const beforeUpload = (file) => {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error(t('media.fileTooLarge'));
    return false;
  }
  const allowed = /image\/(jpeg|png|gif|webp)|video\/mp4|application\/pdf/.test(file.type);
  if (!allowed) {
    ElMessage.error(t('media.unsupportedType'));
    return false;
  }
  return true;
};

const handleUploadSuccess = (res) => {
  ElMessage.success(`${t('media.uploadSuccess')}: ${res.originalName || ''}`);
  tableRef.value?.refresh?.();
  fetchStats();
};

const handleUploadError = (err) => {
  const message = err?.response?.data?.message || err?.message || t('media.uploadFailed');
  ElMessage.error(message);
};

const fetchStats = async () => {
  try {
    const res = await client.get('/medias/stats');
    stats.value = res.data || res;
  } catch {
    // ignore
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.media-preview {
  display: block;
}
</style>
