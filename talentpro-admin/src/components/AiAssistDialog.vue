<template>
  <el-dialog v-model="visible" title="AI 内容助手" width="680px" destroy-on-close>
    <el-form label-position="top">
      <el-form-item label="生成类型">
        <el-select v-model="form.type" style="width: 100%">
          <el-option label="生成标题" value="title" />
          <el-option label="生成摘要" value="excerpt" />
          <el-option label="续写/润色正文" value="content" />
          <el-option label="生成 SEO" value="seo" />
          <el-option label="翻译" value="translate" />
          <el-option label="内容审核" value="moderate" />
        </el-select>
      </el-form-item>

      <el-form-item label="语言 / 语气">
        <div style="display: flex; gap: 8px">
          <el-input v-model="form.language" placeholder="zh / en" style="width: 120px" />
          <el-input v-model="form.tone" placeholder="专业 / 轻松" style="flex: 1" />
        </div>
      </el-form-item>

      <el-form-item label="原始内容 / 提示词">
        <el-input v-model="form.content" type="textarea" :rows="6" placeholder="填写需要 AI 处理的原始内容或提示词..." />
      </el-form-item>

      <el-button type="primary" :loading="loading" @click="handleGenerate">开始生成</el-button>
    </el-form>

    <el-divider />

    <div v-if="result" style="white-space: pre-wrap; line-height: 1.6">
      <div v-if="result.title" style="margin-bottom: 8px"><strong>标题：</strong>{{ result.title }}</div>
      <div v-if="result.description" style="margin-bottom: 8px"><strong>描述：</strong>{{ result.description }}</div>
      <div v-if="result.summary" style="margin-bottom: 8px"><strong>摘要：</strong>{{ result.summary }}</div>
      <div v-if="result.content" style="margin-bottom: 8px"><strong>内容：</strong><br />{{ result.content }}</div>
      <div v-if="result.translation" style="margin-bottom: 8px"><strong>译文：</strong>{{ result.translation }}</div>
      <div v-if="result.keywords && result.keywords.length" style="margin-bottom: 8px">
        <strong>关键词：</strong>
        <el-tag v-for="k in result.keywords" :key="k" size="small" style="margin-right: 4px">{{ k }}</el-tag>
      </div>
      <div v-if="result.issues !== undefined" style="margin-bottom: 8px">
        <strong>审核结果：</strong>
        <el-tag :type="result.moderated ? 'success' : 'warning'">{{ result.moderated ? '通过' : '需处理' }}</el-tag>
        <div v-if="result.suggestion" style="margin-top: 4px; color: #666">{{ result.suggestion }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :disabled="!result" @click="apply">应用到表单</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { aiApi } from '@/api/ai.js';

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
  tone: '专业',
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
    ElMessage.warning('请填写原始内容或提示词');
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
    ElMessage.error(e.message || '生成失败');
  } finally {
    loading.value = false;
  }
};

const apply = () => {
  emit('apply', { action: form.type, result: result.value });
  visible.value = false;
};
</script>
