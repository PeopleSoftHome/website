<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon :size="28" color="#1B5FEB"><Management /></el-icon>
        <span>TalentPro</span>
      </div>
      <el-menu :default-active="$route.path" router class="menu" background-color="#001529" text-color="#bfcbd9" active-text-color="#fff">
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/leads">
          <el-icon><Phone /></el-icon>
          <span>线索管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/contents">
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </el-menu-item>
        <el-menu-item index="/blogs">
          <el-icon><Reading /></el-icon>
          <span>博客管理</span>
        </el-menu-item>
        <el-menu-item index="/forums">
          <el-icon><ChatDotRound /></el-icon>
          <span>论坛管理</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ auth.user?.name || '管理员' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    auth.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #001529; }
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.menu { border-right: none; }
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.header-right { display: flex; align-items: center; gap: 16px; }
.user-info { cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 14px; }
.main { background: #f0f2f5; padding: 20px; }
</style>
