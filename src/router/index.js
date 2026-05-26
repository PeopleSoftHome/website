import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/pages/BlogListView.vue'),
  },
  {
    path: '/blog/:slug',
    name: 'BlogDetail',
    component: () => import('@/pages/BlogDetailView.vue'),
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/pages/ForumView.vue'),
  },
  {
    path: '/forum/topic/:id',
    name: 'ForumTopic',
    component: () => import('@/pages/ForumTopicView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
