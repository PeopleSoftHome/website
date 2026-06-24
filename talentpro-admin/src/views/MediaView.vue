<template>
  <div>
    <h2 style="margin-bottom:20px">媒体库</h2>

    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="16">
        <el-upload
          ref="uploadRef"
          drag
          action="/api/v1/medias/upload"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :show-file-list="false"
          accept="image/*,video/mp4,application/pdf"
        >
          <el-icon :size="48" color="var(--admin-text-secondary)"><Upload /></el-icon>
          <div style="margin-top: 8px; color: var(--admin-text-secondary)">
            拖拽文件到此处，或 <em style="color: var(--admin-color-primary)">点击上传</em>
          </div>
          <template #tip>
            <div style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 8px">
              支持 JPG/PNG/GIF/WebP/MP4/PDF，单文件不超过 10MB
            </div>
          </template>
        </el-upload>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>存储统计</span></template>
          <div v-if="stats" style="display: flex; flex-direction: column; gap: 12px">
            <div style="display: flex; justify-content: space-between">
              <span style="color: var(--admin-text-secondary)">总文件数</span>
              <span style="font-weight: 600">{{ stats.total }}</span>
            </div>
            <div
              v-for="item in stats.byType"
              :key="item.mimeType"
              style="display: flex; justify-content: space-between"
            >
              <span style="color: var(--admin-text-secondary)">{{ item.mimeType }}</span>
              <span>{{ item._count.mimeType }} 个</span>
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
import { Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import CmsTable from '@/components/CmsTable.vue';
import Picture from '@/components/Picture.vue';
import client from '@/api/client.js';
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();
const uploadRef = ref(null);
const tableRef = ref(null);
const stats = ref(null);

const uploadHeaders = ref({
  Authorization: auth.token ? `Bearer ${auth.token}` : '',
});

const columns = [
  { prop: 'url', label: '预览', width: 100 },
  { prop: 'originalName', label: '文件名', minWidth: 200 },
  { prop: 'filename', label: '存储名', width: 180 },
  { prop: 'mimeType', label: '类型', width: 120 },
  { prop: 'size', label: '大小', width: 100 },
  { prop: 'width', label: '尺寸', width: 100, formatter: (row) => row.width ? `${row.width}x${row.height}` : '-' },
  { prop: 'alt', label: 'Alt 文本', width: 150 },
  { prop: 'createdAt', label: '上传时间', width: 160 },
];

const formFields = [
  { prop: 'originalName', label: '文件名', type: 'input' },
  { prop: 'alt', label: 'Alt 文本', type: 'input' },
];

const rules = {
  originalName: [{ required: true, message: '请输入文件名', trigger: 'blur' }],
};

const beforeUpload = (file) => {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB');
    return false;
  }
  const allowed = /image\/(jpeg|png|gif|webp)|video\/mp4|application\/pdf/.test(file.type);
  if (!allowed) {
    ElMessage.error('不支持的文件类型');
    return false;
  }
  return true;
};

const handleUploadSuccess = (res) => {
  ElMessage.success(`上传成功: ${res.originalName || ''}`);
  tableRef.value?.refresh?.();
  fetchStats();
};

const handleUploadError = (err) => {
  const message = err?.response?.data?.message || err?.message || '上传失败';
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
