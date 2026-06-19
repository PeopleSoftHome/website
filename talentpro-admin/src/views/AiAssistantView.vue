<template>
  <div>
    <h2 style="margin-bottom: 20px">AI 内容助手</h2>

    <el-row :gutter="16">
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: 600">生成配置</div>
          </template>

          <el-form label-position="top" size="small">
            <el-form-item label="生成类型">
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="博客文章" value="blog" />
                <el-option label="产品文案" value="product" />
                <el-option label="SEO 元信息" value="seo" />
                <el-option label="翻译" value="translate" />
                <el-option label="内容审核" value="moderate" />
              </el-select>
            </el-form-item>

            <el-form-item label="提示词 / 主题">
              <el-input v-model="form.prompt" type="textarea" :rows="4" placeholder="输入主题、关键词或需求描述..." />
            </el-form-item>

            <el-form-item label="待处理内容">
              <el-input v-model="form.content" type="textarea" :rows="4" placeholder="翻译或审核时填写原始内容..." />
            </el-form-item>

            <el-form-item label="语言 / 语气">
              <div style="display: flex; gap: 8px">
                <el-input v-model="form.language" placeholder="zh / en" style="width: 120px" />
                <el-input v-model="form.tone" placeholder="专业 / 轻松" style="flex: 1" />
              </div>
            </el-form-item>

            <el-button type="primary" :loading="loading" @click="handleGenerate">开始生成</el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: 600">生成结果</div>
          </template>

          <el-empty v-if="!result && !loading" description="点击左侧「开始生成」查看结果" />

          <div v-if="result" style="white-space: pre-wrap; line-height: 1.6">
            <div v-if="result.title" style="margin-bottom: 12px">
              <strong>标题：</strong>{{ result.title }}
            </div>
            <div v-if="result.content" style="margin-bottom: 12px">
              <strong>内容：</strong><br />{{ result.content }}
            </div>
            <div v-if="result.description" style="margin-bottom: 12px">
              <strong>描述：</strong>{{ result.description }}
            </div>
            <div v-if="result.summary" style="margin-bottom: 12px">
              <strong>摘要：</strong>{{ result.summary }}
            </div>
            <div v-if="result.translation" style="margin-bottom: 12px">
              <strong>译文：</strong>{{ result.translation }}
            </div>
            <div v-if="result.keywords && result.keywords.length" style="margin-bottom: 12px">
              <strong>关键词：</strong>
              <el-tag v-for="k in result.keywords" :key="k" size="small" style="margin-right: 4px">{{ k }}</el-tag>
            </div>
            <div v-if="result.features && result.features.length" style="margin-bottom: 12px">
              <strong>核心功能：</strong>
              <ul>
                <li v-for="f in result.features" :key="f">{{ f }}</li>
              </ul>
            </div>
            <div v-if="result.scenarios && result.scenarios.length" style="margin-bottom: 12px">
              <strong>应用场景：</strong>
              <ul>
                <li v-for="s in result.scenarios" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div v-if="result.issues" style="margin-bottom: 12px">
              <strong>审核结果：</strong>
              <el-tag :type="result.moderated ? 'success' : 'warning'">{{ result.moderated ? '通过' : '需处理' }}</el-tag>
              <div v-if="result.suggestion" style="margin-top: 8px; color: #666">{{ result.suggestion }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { aiApi } from '@/api/ai.js';

const loading = ref(false);
const result = ref(null);

const form = reactive({
  type: 'blog',
  prompt: '',
  content: '',
  language: 'zh',
  tone: '专业',
});

const handleGenerate = async () => {
  if (!form.prompt && !form.content) {
    ElMessage.warning('请填写提示词或待处理内容');
    return;
  }

  loading.value = true;
  result.value = null;

  try {
    const res = await aiApi.generate(form);
    result.value = res?.data || res;
  } catch (e) {
    ElMessage.error(e.message || '生成失败');
  } finally {
    loading.value = false;
  }
};
</script>
