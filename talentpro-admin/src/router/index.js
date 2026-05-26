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
