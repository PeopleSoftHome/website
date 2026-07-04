<template>
  <el-dropdown split-button type="warning" size="small" @click="openGenerate('continue')" @command="handleCommand">
    {{ t('aiAssistButton.buttonLabel') }}
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="title">{{ t('aiAssistButton.generateTitle') }}</el-dropdown-item>
        <el-dropdown-item command="excerpt">{{ t('aiAssistButton.generateExcerpt') }}</el-dropdown-item>
        <el-dropdown-item command="content">{{ t('aiAssistButton.continuePolish') }}</el-dropdown-item>
        <el-dropdown-item command="seo">{{ t('aiAssistButton.generateSeo') }}</el-dropdown-item>
        <el-dropdown-item command="translate">{{ t('aiAssistButton.translate') }}</el-dropdown-item>
        <el-dropdown-item command="moderate">{{ t('aiAssistButton.moderate') }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const { t } = useI18n();

const props = defineProps({
  type: { type: String, default: 'blog' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
});

const emit = defineEmits(['result']);

const openGenerate = (action) => {
  if (!props.content && !props.title) {
    ElMessage.warning(t('aiAssistButton.contentRequired'));
    return;
  }
  emit('result', { action, type: props.type, content: props.content, title: props.title });
};

const handleCommand = (cmd) => openGenerate(cmd);
</script>
