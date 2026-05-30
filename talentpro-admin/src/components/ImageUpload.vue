<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      drag
      class="upload-dragger"
    >
      <div v-if="modelValue" class="upload-preview">
        <img :src="modelValue" alt="preview" />
        <div class="upload-mask">
          <el-icon :size="20"><Delete /></el-icon>
          <span>点击或拖拽替换</span>
        </div>
      </div>
      <div v-else>
        <el-icon :size="28"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽图片到此处 或 <em>点击上传</em>
        </div>
      </div>
      <template #tip>
        <div class="el-upload__tip">支持 jpg/png/gif/webp，不超过 5MB</div>
      </template>
    </el-upload>

    <div v-if="modelValue" class="upload-actions">
      <el-button link type="danger" size="small" @click.stop="handleRemove">
        <el-icon><Delete /></el-icon> 删除
      </el-button>
      <el-button link type="primary" size="small" @click.stop="handlePreview">
        <el-icon><View /></el-icon> 预览
      </el-button>
    </div>

    <el-dialog v-model="previewVisible" title="图片预览" append-to-body>
      <img :src="modelValue" style="width: 100%; display: block;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Delete, View } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth.js';

const props = defineProps({
  modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const auth = useAuthStore();
const previewVisible = ref(false);

const uploadUrl = computed(() => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  return `${baseURL}/medias`;
});

const uploadHeaders = computed(() => ({
  Authorization: auth.token ? `Bearer ${auth.token}` : '',
}));

const beforeUpload = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isValid = validTypes.includes(file.type);
  if (!isValid) {
    ElMessage.error('仅支持 jpg/png/gif/webp 格式');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB');
    return false;
  }
  return true;
};

const handleSuccess = (res) => {
  const url = res.data?.url || res.url || res.data;
  if (url) {
    emit('update:modelValue', url);
    ElMessage.success('上传成功');
  } else {
    ElMessage.error('上传响应格式异常');
  }
};

const handleError = () => {
  ElMessage.error('上传失败');
};

const handleRemove = () => {
  emit('update:modelValue', '');
};

const handlePreview = () => {
  previewVisible.value = true;
};
</script>

<style scoped>
.image-upload {
  width: 100%;
}
.upload-dragger {
  width: 100%;
}
.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-preview img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 4px;
}
.upload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 4px;
  font-size: 13px;
}
.upload-preview:hover .upload-mask {
  opacity: 1;
}
.upload-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}
</style>
