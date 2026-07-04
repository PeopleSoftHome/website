<template>
  <el-dialog v-model="visible" :title="t('aiAssistDialog.title')" width="680px" destroy-on-close>
    <el-form label-position="top">
      <el-form-item :label="t('aiAssistDialog.generationType')">
        <el-select v-model="form.type" style="width: 100%">
          <el-option :label="t('aiAssistDialog.typeTitle')" value="title" />
          <el-option :label="t('aiAssistDialog.typeExcerpt')" value="excerpt" />
          <el-option :label="t('aiAssistDialog.typeContent')" value="content" />
          <el-option :label="t('aiAssistDialog.typeSeo')" value="seo" />
          <el-option :label="t('aiAssistDialog.typeTranslate')" value="translate" />
          <el-option :label="t('aiAssistDialog.typeModerate')" value="moderate" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('aiAssistDialog.languageTone')">
        <div style="display: flex; gap: 8px">
          <el-input v-model="form.language" :placeholder="t('aiAssistDialog.languagePlaceholder')" style="width: 120px" />
          <el-input v-model="form.tone" :placeholder="t('aiAssistDialog.tonePlaceholder')" style="flex: 1" />
        </div>
      </el-form-item>

      <el-form-item :label="t('aiAssistDialog.originalContent')">
        <el-input v-model="form.content" type="textarea" :rows="6" :placeholder="t('aiAssistDialog.contentPlaceholder')" />
      </el-form-item>

      <el-button type="primary" :loading="loading" @click="handleGenerate">{{ t('aiAssistDialog.generate') }}</el-button>
    </el-form>

    <el-divider />

    <div v-if="result" style="white-space: pre-wrap; line-height: 1.6">
      <div v-if="result.title" style="margin-bottom: 8px"><strong>{{ t('aiAssistDialog.titleLabel') }}</strong>{{ result.title }}</div>
      <div v-if="result.description" style="margin-bottom: 8px"><strong>{{ t('aiAssistDialog.descriptionLabel') }}</strong>{{ result.description }}</div>
      <div v-if="result.summary" style="margin-bottom: 8px"><strong>{{ t('aiAssistDialog.summaryLabel') }}</strong>{{ result.summary }}</div>
      <div v-if="result.content" style="margin-bottom: 8px"><strong>{{ t('aiAssistDialog.contentLabel') }}</strong><br />{{ result.content }}</div>
      <div v-if="result.translation" style="margin-bottom: 8px"><strong>{{ t('aiAssistDialog.translationLabel') }}</strong>{{ result.translation }}</div>
      <div v-if="result.keywords && result.keywords.length" style="margin-bottom: 8px">
        <strong>{{ t('aiAssistDialog.keywordsLabel') }}</strong>
        <el-tag v-for="k in result.keywords" :key="k" size="small" style="margin-right: 4px">{{ k }}</el-tag>
      </div>
      <div v-if="result.issues !== undefined" style="margin-bottom: 8px">
        <strong>{{ t('aiAssistDialog.moderationLabel') }}</strong>
        <el-tag :type="result.moderated ? 'success' : 'warning'">{{ result.moderated ? t('aiAssistDialog.passed') : t('aiAssistDialog.needsAction') }}</el-tag>
        <div v-if="result.suggestion" style="margin-top: 4px; color: var(--admin-text-secondary)">{{ result.suggestion }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('aiAssistDialog.close') }}</el-button>
      <el-button type="primary" :disabled="!result" @click="apply">{{ t('aiAssistDialog.applyToForm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { aiApi } from '@/api/ai.js';

const { t } = useI18n();

const visible = defineModel('visible', { type: Boolean, default: false });

const props = defineProps({
  type: { type: String, default: 'blog' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
});

const emit = defineEmits(['apply']);

const loading = ref(false);
const result = ref(null);

const form = reactive({
  type: 'content',
  language: 'zh',
  tone: 'professional',
  content: '',
});

watch(visible, (v) => {
  if (v) {
    result.value = null;
    form.content = props.content || props.title || '';
  }
});

const handleGenerate = async () => {
  if (!form.content) {
    ElMessage.warning(t('aiAssistDialog.contentRequired'));
    return;
  }
  loading.value = true;
  result.value = null;
  try {
    const promptMap = {
      title: `为以下内容生成 3 个吸引人的标题：\n${form.content}`,
      excerpt: `为以下内容生成一段 100 字以内的摘要：\n${form.content}`,
      content: `请续写或润色以下内容，保持专业语气：\n${form.content}`,
      seo: `为以下内容生成 SEO 标题、描述和关键词：\n${form.content}`,
      translate: `请将以下内容翻译成 ${form.language}：\n${form.content}`,
      moderate: `请审核以下内容是否合规：\n${form.content}`,
    };
    const res = await aiApi.generate({
      type: props.type,
      prompt: promptMap[form.type],
      content: form.content,
      language: form.language,
      tone: form.tone,
    });
    result.value = res?.data || res;
  } catch (e) {
    ElMessage.error(e.message || t('aiAssistDialog.generateFailed'));
  } finally {
    loading.value = false;
  }
};

const apply = () => {
  emit('apply', { action: form.type, result: result.value });
  visible.value = false;
};
</script>
