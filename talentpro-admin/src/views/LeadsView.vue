<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">线索管理</h2>
      <el-button type="primary" size="small" @click="exportLeads" :loading="exporting">
        导出 Excel
      </el-button>
    </div>
    <el-card shadow="hover">
      <el-table :data="list.items" v-loading="list.loading" size="default" @row-click="openDetail">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column prop="products" label="意向产品">
          <template #default="{ row }">
            <el-tag v-for="p in (row.products||[])" :key="p" size="small" style="margin-right:4px">{{ p }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        layout="prev, pager, next"
        :total="list.total"
        :page-size="list.pageSize"
        v-model:current-page="list.page"
        @current-change="list.fetch"
      />
    </el-card>

    <!-- Lead 详情抽屉 -->
    <el-drawer v-model="drawerVisible" :title="`线索详情 — ${selectedLead?.name || ''}`" size="500px">
      <div v-if="selectedLead" v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ selectedLead.name }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ selectedLead.company }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ selectedLead.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedLead.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业规模">{{ selectedLead.scale }}</el-descriptions-item>
          <el-descriptions-item label="意向产品">
            <el-tag v-for="p in (selectedLead.products||[])" :key="p" size="small" style="margin-right:4px">{{ p }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="来源">{{ selectedLead.source }}</el-descriptions-item>
          <el-descriptions-item label="IP 地址">{{ selectedLead.ipAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDate(selectedLead.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:24px">
          <h4>状态流转</h4>
          <el-radio-group v-model="selectedLead.status" size="small" @change="updateStatus">
            <el-radio-button label="NEW">新建</el-radio-button>
            <el-radio-button label="CONTACTED">已联系</el-radio-button>
            <el-radio-button label="QUALIFIED">已确认</el-radio-button>
            <el-radio-button label="DEMOED">已演示</el-radio-button>
            <el-radio-button label="NEGOTIATION">谈判中</el-radio-button>
            <el-radio-button label="WON">成交</el-radio-button>
            <el-radio-button label="LOST">关闭</el-radio-button>
          </el-radio-group>
        </div>

        <div style="margin-top:24px">
          <h4>跟进记录</h4>
          <el-timeline v-if="followUps.length">
            <el-timeline-item
              v-for="item in followUps"
              :key="item.id"
              :timestamp="formatDate(item.createdAt)"
              :type="item.type === 'call' ? 'primary' : 'info'"
            >
              <p style="margin:0;font-weight:500">{{ item.type }}</p>
              <p style="margin:4px 0 0;color:var(--admin-text-secondary);font-size:13px">{{ item.content }}</p>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟进记录" :image-size="80" />

          <el-form :model="newFollowUp" style="margin-top:16px">
            <el-form-item label="类型" label-width="60px">
              <el-select v-model="newFollowUp.type" size="small" style="width:120px">
                <el-option label="电话" value="call" />
                <el-option label="邮件" value="email" />
                <el-option label="微信" value="wechat" />
                <el-option label="备注" value="note" />
              </el-select>
            </el-form-item>
            <el-form-item label="内容" label-width="60px">
              <el-input
                v-model="newFollowUp.content"
                type="textarea"
                rows="2"
                placeholder="输入跟进内容..."
                size="small"
              />
            </el-form-item>
            <el-form-item label-width="60px">
              <el-button type="primary" size="small" @click="addFollowUp" :loading="addingFollowUp">
                添加跟进
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { formatDate } from '@/utils/formatDate.js';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import client from '@/api/client.js';
import { useList } from '@/composables/useList.js';
import { downloadFile } from '@/utils/downloadFile.js';

const list = useList({
  fetchFn: (p) => client.get(`/demo-bookings?page=${p.page}&pageSize=${p.pageSize}`),
});

const drawerVisible = ref(false);
const detailLoading = ref(false);
const selectedLead = ref(null);
const followUps = ref([]);
const addingFollowUp = ref(false);
const exporting = ref(false);
const newFollowUp = reactive({ type: 'call', content: '' });

const openDetail = async (row) => {
  selectedLead.value = row;
  drawerVisible.value = true;
  detailLoading.value = true;
  try {
    const res = await client.get(`/demo-bookings/${row.id}`);
    selectedLead.value = res.data || res;
    followUps.value = selectedLead.value.followUps || [];
  } catch (e) {
    ElMessage.error('加载详情失败');
  }
  detailLoading.value = false;
};

const statusType = (s) => {
  const map = {
    NEW: 'info',
    CONTACTED: 'warning',
    QUALIFIED: 'success',
    DEMOED: 'success',
    NEGOTIATION: 'warning',
    WON: 'success',
    LOST: 'danger',
  };
  return map[s] || 'info';
};


const updateStatus = async (status) => {
  try {
    await client.patch(`/demo-bookings/${selectedLead.value.id}`, { status });
    ElMessage.success('状态已更新');
    list.fetch();
  } catch (e) {
    ElMessage.error('状态更新失败');
  }
};

const addFollowUp = async () => {
  if (!newFollowUp.content.trim()) {
    ElMessage.warning('请输入跟进内容');
    return;
  }
  addingFollowUp.value = true;
  try {
    const res = await client.post(`/demo-bookings/${selectedLead.value.id}/follow-ups`, {
      type: newFollowUp.type,
      content: newFollowUp.content,
      createdBy: 'admin',
    });
    followUps.value.unshift(res.data);
    newFollowUp.content = '';
    ElMessage.success('跟进记录已添加');
  } catch (e) {
    ElMessage.error('添加失败');
  }
  addingFollowUp.value = false;
};

const exportLeads = async () => {
  exporting.value = true;
  try {
    const res = await client.get('/admin/export/leads?format=xlsx', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    downloadFile(blob, `leads-${Date.now()}.xlsx`);
    ElMessage.success('导出成功');
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error(e);
    }
    ElMessage.error('导出失败');
  }
  exporting.value = false;
};
</script>
