<template>
  <el-container class="layout">
    <!-- 桌面端侧边栏 -->
    <el-aside width="220px" class="aside desktop-aside">
      <div class="logo">
        <el-icon :size="28" color="var(--admin-color-primary)"><Management /></el-icon>
        <span>TalentPro</span>
      </div>
      <el-menu :default-active="$route.path" router class="menu" background-color="var(--admin-sidebar-bg)" text-color="var(--admin-sidebar-text)" active-text-color="var(--admin-white)">
        <template v-for="item in visibleMenu" :key="item.path || item.label">
          <el-sub-menu v-if="item.children" :index="item.label">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button class="mobile-menu-btn" text @click="drawerVisible = true">
            <el-icon :size="20"><Fold /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <NotificationBell />
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

  <!-- 移动端侧边栏抽屉 -->
  <el-drawer
    v-model="drawerVisible"
    direction="ltr"
    size="240px"
    :with-header="false"
    class="mobile-drawer"
  >
    <div class="logo">
      <el-icon :size="28" color="var(--admin-color-primary)"><Management /></el-icon>
      <span>TalentPro</span>
    </div>
    <el-menu :default-active="$route.path" router class="menu" background-color="var(--admin-sidebar-bg)" text-color="var(--admin-sidebar-text)" active-text-color="var(--admin-white)" @select="drawerVisible = false">
      <template v-for="item in visibleMenu" :key="item.path || item.label">
        <el-sub-menu v-if="item.children" :index="item.label">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <span>{{ child.label }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </el-drawer>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { Fold, ArrowDown, Management } from '@element-plus/icons-vue';
import NotificationBell from '@/components/NotificationBell.vue';
import { menuConfig, hasMenuPermission } from '@/config/menu.config.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const drawerVisible = ref(false);

/**
 * 根据当前用户角色过滤可见菜单
 */
const visibleMenu = computed(() => {
  const userRole = auth.role;
  return menuConfig.filter((item) => {
    if (!hasMenuPermission(item, userRole, auth)) return false;
    if (item.children) {
      item.children = item.children.filter((child) => hasMenuPermission(child, userRole, auth));
      return item.children.length > 0;
    }
    return true;
  });
});

/**
 * 自动生成面包屑
 * 从 menuConfig 中查找当前路径对应的层级结构
 */
const breadcrumbs = computed(() => {
  const path = route.path;
  const result = [];

  function findBreadcrumb(items, depth = 0) {
    for (const item of items) {
      if (item.children) {
        const childMatch = item.children.find((c) => c.path === path);
        if (childMatch) {
          if (depth === 0) result.push({ title: item.label, path: item.children[0]?.path });
          result.push({ title: childMatch.label, path: undefined });
          return true;
        }
        if (findBreadcrumb(item.children, depth + 1)) return true;
      }
      if (item.path === path) {
        result.push({ title: item.label, path: undefined });
        return true;
      }
    }
    return false;
  }

  findBreadcrumb(menuConfig);

  if (result.length === 0) {
    return [{ title: '首页', path: undefined }];
  }
  return result;
});

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    auth.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: var(--admin-sidebar-bg); }
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--admin-white);
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid var(--admin-white-alpha-10);
}
.menu { border-right: none; }
.header {
  background: var(--admin-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px var(--admin-black-alpha-8);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.main {
  background: var(--admin-bg-page);
  padding: 20px;
  overflow-x: auto;
}
.mobile-menu-btn {
  display: none;
  padding: 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .desktop-aside {
    display: none !important;
  }
  .mobile-menu-btn {
    display: inline-flex !important;
  }
  .header {
    padding: 0 12px;
  }
  .main {
    padding: 12px;
  }
  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 90vw;
    margin: 0 auto;
  }
  :deep(.el-dialog__body) {
    max-height: 70vh;
    overflow-y: auto;
  }
}

/* 移动端抽屉样式 */
:deep(.mobile-drawer .el-drawer__body) {
  padding: 0;
  background: var(--admin-sidebar-bg);
}
:deep(.mobile-drawer .el-drawer__body .logo) {
  border-bottom: 1px solid var(--admin-white-alpha-10);
}
</style>
