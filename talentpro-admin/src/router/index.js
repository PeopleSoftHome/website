import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/views/LayoutView.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'leads', component: () => import('@/views/LeadsView.vue') },
      { path: 'users', component: () => import('@/views/UsersView.vue') },
      { path: 'contents', component: () => import('@/views/ContentsView.vue') },
      { path: 'blogs', component: () => import('@/views/BlogManagerView.vue') },
      { path: 'forums', component: () => import('@/views/ForumManagerView.vue') },
      { path: 'comment-moderation', component: () => import('@/views/CommentModerationView.vue') },
      { path: 'analytics', component: () => import('@/views/AnalyticsView.vue') },
      { path: 'experiments', component: () => import('@/views/ExperimentView.vue') },
      { path: 'download-records', component: () => import('@/views/DownloadRecordView.vue') },
      { path: 'sensitive-words', component: () => import('@/views/SensitiveWordView.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && auth.isLoggedIn) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
