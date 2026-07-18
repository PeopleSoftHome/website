<!--
  Sensitive Word View 组件

  位于: views/SensitiveWordView.vue
-->
<template>
  <div>
    <h2 style="margin-bottom:20px">{{ t('sensitiveWords.title') }}</h2>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight:600">{{ t('sensitiveWords.wordList') }}</div>
          </template>
          <div style="margin-bottom:12px;display:flex;gap:8px">
            <el-input v-model="newWord.word" :placeholder="t('sensitiveWords.wordPlaceholder')" size="small" style="width:140px" />
            <el-select v-model="newWord.category" :placeholder="t('sensitiveWords.categoryPlaceholder')" size="small" style="width:100px">
              <el-option :label="t('sensitiveWords.categories.spam')" value="spam" />
              <el-option :label="t('sensitiveWords.categories.ad')" value="ad" />
              <el-option :label="t('sensitiveWords.categories.offensive')" value="offensive" />
              <el-option :label="t('sensitiveWords.categories.political')" value="political" />
            </el-select>
            <el-select v-model="newWord.severity" :placeholder="t('sensitiveWords.severityPlaceholder')" size="small" style="width:90px">
              <el-option :label="t('sensitiveWords.severityLow')" :value="1" />
              <el-option :label="t('sensitiveWords.severityMedium')" :value="2" />
              <el-option :label="t('sensitiveWords.severityHigh')" :value="3" />
            </el-select>
            <el-button type="primary" size="small" @click="addWord" v-permission="'sensitive-word:create'">{{ t('sensitiveWords.add') }}</el-button>
          </div>

          <el-table :data="words" v-loading="loading" size="small">
            <el-table-column prop="word" :label="t('sensitiveWords.word')" width="140" />
            <el-table-column prop="category" :label="t('sensitiveWords.category')" width="90">
              <template #default="{ row }">
                <el-tag size="small" :type="categoryType(row.category)">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="severity" :label="t('sensitiveWords.severity')" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="severityType(row.severity)">{{ severityLabel(row.severity) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('common.actions')" width="80" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removeWord(row.id)">{{ t('sensitiveWords.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight:600">{{ t('sensitiveWords.contentDetection') }}</div>
          </template>
          <el-input v-model="testContent" type="textarea" :rows="4" :placeholder="t('sensitiveWords.testPlaceholder')" />
          <el-button type="primary" size="small" style="margin-top:8px" @click="testModeration">{{ t('sensitiveWords.detect') }}</el-button>

          <div v-if="testResult" style="margin-top:16px">
            <el-divider />
            <div style="margin-bottom:8px">
              <span style="font-weight:600">{{ t('sensitiveWords.riskScore') }}</span>
              <el-tag :type="testResult.riskScore > 0.5 ? 'danger' : testResult.riskScore > 0.3 ? 'warning' : 'success'">
                {{ (testResult.riskScore * 100).toFixed(0) }}%
              </el-tag>
            </div>
            <div style="margin-bottom:8px">
              <span style="font-weight:600">{{ t('sensitiveWords.flags') }}</span>
              <el-tag v-for="flag in testResult.flags" :key="flag" size="small" type="info" style="margin-right:4px">{{ flag }}</el-tag>
              <span v-if="!testResult.flags.length" style="color:var(--admin-text-placeholder)">{{ t('sensitiveWords.none') }}</span>
            </div>
            <div>
              <span style="font-weight:600">{{ t('sensitiveWords.autoApprove') }}</span>
              <el-tag :type="testResult.autoApprove ? 'success' : 'warning'">{{ testResult.autoApprove ? t('sensitiveWords.autoApproveYes') : t('sensitiveWords.manualReview') }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import client from '@/api/client';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();

const words = ref([]);
const loading = ref(false);
const newWord = reactive({ word: '', category: 'spam', severity: 2 });
const testContent = ref('');
const testResult = ref(null);

const severityLabel = (level) => {
  const map = {
    1: t('sensitiveWords.severityLow'),
    2: t('sensitiveWords.severityMedium'),
    3: t('sensitiveWords.severityHigh'),
  };
  return map[level] || '';
};

const fetchWords = async () => {
  loading.value = true;
  try {
    const res = await client.get('/system/sensitive-words');
    words.value = res.data ?? [];
  } catch (e) {
    words.value = [];
  }
  loading.value = false;
};

const addWord = async () => {
  if (!newWord.word.trim()) return;
  try {
    await client.post('/system/sensitive-words', { ...newWord });
    ElMessage.success(t('sensitiveWords.addSuccess'));
    newWord.word = '';
    fetchWords();
  } catch (e) {
    ElMessage.error(t('sensitiveWords.addFailed'));
  }
};

const removeWord = async (id) => {
  try {
    await ElMessageBox.confirm(t('sensitiveWords.deleteConfirm'), t('sensitiveWords.deleteTip'), { type: 'warning' });
    await client.delete(`/system/sensitive-words/${id}`);
    ElMessage.success(t('sensitiveWords.deleted'));
    fetchWords();
  } catch {
    // cancel or fail
  }
};

const testModeration = async () => {
  try {
    const res = await client.post('/system/moderation-test', { content: testContent.value });
    testResult.value = res.data;
  } catch (e) {
    // local simulation
    const lower = testContent.value.toLowerCase();
    const flags = [];
    let riskScore = 0;
    const spamPatterns = [
      /(微信|vx|v信|薇信|加微)[：:]?\s*[\w-]+/gi,
      /(qq|QQ)[：:]?\s*\d{5,}/g,
      /(电话|联系方式|加我)[：:]?\s*\d{7,}/g,
      /(免费|优惠|促销|打折|代购|代理|加盟)/gi,
      /(http|https):\/\/[^\s]+/g,
    ];
    for (const pattern of spamPatterns) {
      if (pattern.test(testContent.value)) { flags.push('spam'); riskScore += 0.3; break; }
    }
    if (testContent.value.length > 500 && /[a-zA-Z0-9]{20,}/.test(testContent.value)) {
      flags.push('suspicious'); riskScore += 0.2;
    }
    riskScore = Math.min(riskScore, 1);
    testResult.value = { riskScore: Math.round(riskScore * 100) / 100, flags: [...new Set(flags)], autoApprove: riskScore < 0.3 && flags.length === 0 };
  }
};

const categoryType = (c) => ({ spam: 'danger', ad: 'warning', offensive: 'info', political: 'info' }[c] || 'info');
const severityType = (s) => ({ 1: 'success', 2: 'warning', 3: 'danger' }[s] || 'info');

onMounted(fetchWords);
</script>
