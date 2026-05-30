<template>
  <div>
    <h2 style="margin-bottom:20px">内容管理</h2>
    <el-card shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="产品" name="products">
          <el-table :data="products" v-loading="loading" size="default">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="行业方案" name="industries">
          <el-table :data="industries" v-loading="loading" size="default">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="slug" label="标识" width="120" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="资源" name="resources">
          <el-table :data="resources" v-loading="loading" size="default">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="date" label="日期" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import client from '@/api/client.js';

const activeTab = ref('products');
const loading = ref(false);
const products = ref([]);
const industries = ref([]);
const resources = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const tab = activeTab.value;
    if (tab === 'products') {
      const res = await client.get('/cms/products');
      products.value = res.data ?? [];
    } else if (tab === 'industries') {
      const res = await client.get('/cms/industries');
      industries.value = res.data ?? [];
    } else if (tab === 'resources') {
      const res = await client.get('/cms/resources');
      resources.value = res.data ?? [];
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error(e);
    }
  }
  loading.value = false;
};

watch(activeTab, fetchData, { immediate: true });
</script>
