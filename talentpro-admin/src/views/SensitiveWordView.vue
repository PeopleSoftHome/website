<template>
  <div>
    <h2 style="margin-bottom:20px">敏感词管理</h2>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight:600">词库列表</div>
          </template>
          <div style="margin-bottom:12px;display:flex;gap:8px">
            <el-input v-model="newWord.word" placeholder="敏感词" size="small" style="width:140px" />
            <el-select v-model="newWord.category" placeholder="分类" size="small" style="width:100px">
              <el-option label="垃圾" value="spam" />
              <el-option label="广告" value="ad" />
              <el-option label="攻击性" value="offensive" />
              <el-option label="政治" value="political" />
            </el-select>
            <el-select v-model="newWord.severity" placeholder="等级" size="small" style="width:90px">
              <el-option label="低" :value="1" />
              <el-option label="中" :value="2" />
              <el-option label="高" :value="3" />
            </el-select>
            <el-button type="primary" size="small" @click="addWord" v-permission="'sensitive-word:create'">添加</el-button>
          </div>

          <el-table :data="words" v-loading="loading" size="small">
            <el-table-column prop="word" label="敏感词" width="140" />
            <el-table-column prop="category" label="分类" width="90">
              <template #default="{ row }">
                <el-tag size="small" :type="categoryType(row.category)">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="severity" label="严重度" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="severityType(row.severity)">{{ ['低','中','高'][row.severity - 1] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removeWord(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-weight:600">内容检测模拟</div>
          </template>
          <el-input v-model="testContent" type="textarea" :rows="4" placeholder="输入评论内容测试检测效果..." />
          <el-button type="primary" size="small" style="margin-top:8px" @click="testModeration">检测</el-button>

          <div v-if="testResult" style="margin-top:16px">
            <el-divider />
            <div style="margin-bottom:8px">
              <span style="font-weight:600">风险评分：</span>
              <el-tag :type="testResult.riskScore > 0.5 ? 'danger' : testResult.riskScore > 0.3 ? 'warning' : 'success'">
                {{ (testResult.riskScore * 100).toFixed(0) }}%
              </el-tag>
            </div>
            <div style="margin-bottom:8px">
              <span style="font-weight:600">标记标签：</span>
              <el-tag v-for="flag in testResult.flags" :key="flag" size="small" type="info" style="margin-right:4px">{{ flag }}</el-tag>
              <span v-if="!testResult.flags.length" style="color:var(--admin-text-placeholder)">无</span>
            </div>
            <div>
              <span style="font-weight:600">自动审批：</span>
              <el-tag :type="testResult.autoApprove ? 'success' : 'warning'">{{ testResult.autoApprove ? '通过' : '人工审核' }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import client from '@/api/client.js';
import { ElMessage, ElMessageBox } from 'element-plus';

const words = ref([]);
const loading = ref(false);
const newWord = reactive({ word: '', category: 'spam', severity: 2 });
const testContent = ref('');
const testResult = ref(null);

const fetchWords = async () => {
  loading.value = true;
  try {
    // 使用 Prisma 直接查询，后端暂无可直接查 sensitive_words 的公开 API
    // 这里通过 system/settings 或自定义 endpoint 获取
    // 为简化，调用 admin 通用接口
    const res = await client.get('/system/sensitive-words');
    words.value = res.data ?? [];
  } catch (e) {
    // fallback: 如果后端无此接口，留空
    words.value = [];
  }
  loading.value = false;
};

const addWord = async () => {
  if (!newWord.word.trim()) return;
  try {
    await client.post('/system/sensitive-words', { ...newWord });
    ElMessage.success('添加成功');
    newWord.word = '';
    fetchWords();
  } catch (e) {
    ElMessage.error('添加失败（后端接口需补充）');
  }
};

const removeWord = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该敏感词？', '确认', { type: 'warning' });
    await client.delete(`/system/sensitive-words/${id}`);
    ElMessage.success('已删除');
    fetchWords();
  } catch {
    // 取消或失败
  }
};

const testModeration = async () => {
  try {
    const res = await client.post('/system/moderation-test', { content: testContent.value });
    testResult.value = res.data;
  } catch (e) {
    // 本地模拟计算
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
