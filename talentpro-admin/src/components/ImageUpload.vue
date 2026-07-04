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
          <span>{{ t('imageUpload.replaceHint') }}</span>
        </div>
      </div>
      <div v-else>
        <el-icon :size="28"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          {{ t('imageUpload.dragHint') }} <em>{{ t('imageUpload.clickUpload') }}</em>
        </div>
      </div>
      <template #tip>
        <div class="el-upload__tip">{{ t('imageUpload.tip') }}</div>
      </template>
    </el-upload>

    <div v-if="enableAiGenerate && !modelValue" class="ai-generate-area">
      <el-button type="primary" size="small" text @click="openAiDialog">
        <el-icon><MagicStick /></el-icon> {{ t('imageUpload.aiGenerate') }}
      </el-button>
    </div>

    <div v-if="modelValue" class="upload-actions">
      <el-button link type="danger" size="small" @click.stop="handleRemove">
        <el-icon><Delete /></el-icon> {{ t('imageUpload.delete') }}
      </el-button>
      <el-button link type="primary" size="small" @click.stop="handlePreview">
        <el-icon><View /></el-icon> {{ t('imageUpload.preview') }}
      </el-button>
    </div>

    <el-dialog v-model="previewVisible" :title="t('imageUpload.previewTitle')" append-to-body>
      <img :src="modelValue" style="width: 100%; display: block;" />
    </el-dialog>

    <el-dialog v-model="aiDialogVisible" :title="t('imageUpload.aiGenerate')" width="480px" append-to-body destroy-on-close>
      <el-form label-position="top">
        <el-form-item :label="t('imageUpload.aiGeneratePrompt')">
          <el-input v-model="aiPrompt" type="textarea" :rows="3" :placeholder="t('imageUpload.aiGeneratePrompt')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="aiDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="aiGenerating" @click="handleAiGenerate">{{ t('imageUpload.aiGenerateConfirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { UploadFilled, Delete, View, MagicStick } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth.js';
import { aiApi } from '@/api/ai.js';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: String, default: '' },
  enableAiGenerate: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

const auth = useAuthStore();
const previewVisible = ref(false);
const aiDialogVisible = ref(false);
const aiGenerating = ref(false);
const aiPrompt = ref('');

const uploadUrl = computed(() => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  return `${baseURL.replace(/\/$/, '')}/medias/upload`;
});

const uploadHeaders = computed(() => ({
  Authorization: auth.token ? `Bearer ${auth.token}` : '',
}));

const beforeUpload = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isValid = validTypes.includes(file.type);
  if (!isValid) {
    ElMessage.error(t('imageUpload.invalidType'));
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error(t('imageUpload.tooLarge'));
    return false;
  }
  return true;
};

const handleSuccess = (res) => {
  const url = res.data?.url || res.url || res.data;
  if (url) {
    emit('update:modelValue', url);
    ElMessage.success(t('imageUpload.uploadSuccess'));
  } else {
    ElMessage.error(t('imageUpload.invalidResponse'));
  }
};

const handleError = () => {
  ElMessage.error(t('imageUpload.uploadFailed'));
};

const handleRemove = () => {
  emit('update:modelValue', '');
};

const handlePreview = () => {
  previewVisible.value = true;
};

const openAiDialog = () => {
  aiPrompt.value = '';
  aiDialogVisible.value = true;
};

const handleAiGenerate = async () => {
  if (!aiPrompt.value.trim()) {
    ElMessage.warning(t('imageUpload.aiGeneratePrompt'));
    return;
  }
  aiGenerating.value = true;
  try {
    const res = await aiApi.generateImage({ prompt: aiPrompt.value.trim() });
    const url = res?.url || res?.imageUrl;
    if (url) {
      emit('update:modelValue', url);
      ElMessage.success(t('imageUpload.uploadSuccess'));
      aiDialogVisible.value = false;
    } else {
      ElMessage.error(t('imageUpload.invalidResponse'));
    }
  } catch (e) {
    ElMessage.error(e.message || t('imageUpload.uploadFailed'));
  } finally {
    aiGenerating.value = false;
  }
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
  background: var(--admin-mask);
  color: var(--admin-white);
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

.ai-generate-area {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}
</style>
