<!--
  Ai Assistant View 组件

  位于: views/AiAssistantView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom: 20px">{{ t('aiAssistant.title') }}</h2>

    <el-card v-if="providerStatus.length" shadow="never" style="margin-bottom: 16px">
      <div style="font-weight: 600; margin-bottom: 12px">{{ t('aiAssistant.providerStatus') }}</div>
      <el-space wrap>
        <el-tag
          v-for="p in providerStatus"
          :key="p.provider"
          :type="p.active ? 'primary' : p.configured ? 'success' : 'info'"
          effect="dark"
        >
          {{ p.provider }}
          <span v-if="p.active"> · {{ t('aiAssistant.providerActive') }}</span>
          <span v-else-if="p.configured"> · {{ t('aiAssistant.providerConfigured') }}</span>
          <span v-else> · {{ t('aiAssistant.providerNotConfigured') }}</span>
          <span v-if="p.fallback"> · {{ t('aiAssistant.providerFallback') }}</span>
        </el-tag>
      </el-space>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: 600">{{ t('aiAssistant.generationConfig') }}</div>
          </template>

          <el-form label-position="top" size="small">
            <el-form-item :label="t('aiAssistant.generationType')">
              <el-select v-model="form.type" style="width: 100%">
                <el-option :label="t('aiAssistant.typeOptions.blog')" value="blog" />
                <el-option :label="t('aiAssistant.typeOptions.product')" value="product" />
                <el-option :label="t('aiAssistant.typeOptions.seo')" value="seo" />
                <el-option :label="t('aiAssistant.typeOptions.translate')" value="translate" />
                <el-option :label="t('aiAssistant.typeOptions.moderate')" value="moderate" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('aiAssistant.prompt')">
              <el-input v-model="form.prompt" type="textarea" :rows="4" :placeholder="t('aiAssistant.promptPlaceholder')" />
            </el-form-item>

            <el-form-item :label="t('aiAssistant.contentToProcess')">
              <el-input v-model="form.content" type="textarea" :rows="4" :placeholder="t('aiAssistant.contentPlaceholder')" />
            </el-form-item>

            <el-form-item :label="t('aiAssistant.languageTone')">
              <div style="display: flex; gap: 8px">
                <el-input v-model="form.language" :placeholder="t('aiAssistant.language')" style="width: 120px" />
                <el-input v-model="form.tone" :placeholder="t('aiAssistant.tone')" style="flex: 1" />
              </div>
            </el-form-item>

            <el-button type="primary" :loading="loading" @click="handleGenerate">{{ t('aiAssistant.startGeneration') }}</el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight: 600">{{ t('aiAssistant.resultTitle') }}</div>
          </template>

          <el-empty v-if="!result && !loading" :description="t('aiAssistant.emptyHint')" />

          <div v-if="result" style="white-space: pre-wrap; line-height: 1.6">
            <div v-if="result.title" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.titleLabel') }}</strong>{{ result.title }}
            </div>
            <div v-if="result.content" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.contentLabel') }}</strong><br />{{ result.content }}
            </div>
            <div v-if="result.description" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.descriptionLabel') }}</strong>{{ result.description }}
            </div>
            <div v-if="result.summary" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.summaryLabel') }}</strong>{{ result.summary }}
            </div>
            <div v-if="result.translation" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.translationLabel') }}</strong>{{ result.translation }}
            </div>
            <div v-if="result.keywords && result.keywords.length" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.keywordsLabel') }}</strong>
              <el-tag v-for="k in result.keywords" :key="k" size="small" style="margin-right: 4px">{{ k }}</el-tag>
            </div>
            <div v-if="result.features && result.features.length" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.featuresLabel') }}</strong>
              <ul>
                <li v-for="f in result.features" :key="f">{{ f }}</li>
              </ul>
            </div>
            <div v-if="result.scenarios && result.scenarios.length" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.scenariosLabel') }}</strong>
              <ul>
                <li v-for="s in result.scenarios" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div v-if="result.issues" style="margin-bottom: 12px">
              <strong>{{ t('aiAssistant.moderationLabel') }}</strong>
              <el-tag :type="result.moderated ? 'success' : 'warning'">{{ result.moderated ? t('aiAssistant.passed') : t('aiAssistant.needsAction') }}</el-tag>
              <div v-if="result.suggestion" style="margin-top: 8px; color: var(--admin-text-secondary)">{{ result.suggestion }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { aiApi } from '@/api/ai';

const { t } = useI18n();

const loading = ref(false);
const result = ref(null);
const providerStatus = ref([]);

const loadProviderStatus = async () => {
  try {
    const data = await aiApi.getProviderStatus();
    providerStatus.value = Array.isArray(data) ? data : data?.data || [];
  } catch {
    providerStatus.value = [];
  }
};

onMounted(() => {
  loadProviderStatus();
});

const form = reactive({
  type: 'blog',
  prompt: '',
  content: '',
  language: 'zh',
  tone: 'professional',
});

const handleGenerate = async () => {
  if (!form.prompt && !form.content) {
    ElMessage.warning(t('aiAssistant.promptRequired'));
    return;
  }

  loading.value = true;
  result.value = null;

  try {
    const res = await aiApi.generate(form);
    result.value = res?.data || res;
  } catch (e) {
    ElMessage.error(e.message || t('aiAssistant.generateFailed'));
  } finally {
    loading.value = false;
  }
};
</script>
