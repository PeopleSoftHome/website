import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { title: 'pageTitle', description: 'pageDesc' },
      },
      {
        path: '/blog',
        name: 'Blog',
        component: () => import('@/pages/BlogListView.vue'),
        meta: { title: 'blog.pageTitle' },
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
        meta: { title: 'forum.pageTitle' },
      },
      {
        path: '/forum/topic/:id',
        name: 'ForumTopic',
        component: () => import('@/pages/ForumTopicView.vue'),
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { title: 'profile.title', requiresAuth: true },
      },
      // Phase 2: 产品矩阵 + 解决方案
      {
        path: '/products',
        name: 'Products',
        component: () => import('@/pages/ProductListView.vue'),
        meta: { title: 'productPage.title', description: 'productPage.subtitle' },
      },
      {
        path: '/products/:slug',
        name: 'ProductDetail',
        component: () => import('@/pages/ProductDetailView.vue'),
      },
      {
        path: '/solutions',
        name: 'Solutions',
        component: () => import('@/pages/SolutionListView.vue'),
        meta: { title: 'solutions.title', description: 'solutions.subtitle' },
      },
      {
        path: '/solutions/:slug',
        name: 'SolutionDetail',
        component: () => import('@/pages/SolutionDetailView.vue'),
      },
      // Phase 3: 客户案例
      {
        path: '/cases',
        name: 'Cases',
        component: () => import('@/pages/CaseListView.vue'),
        meta: { title: 'cases.title', description: 'cases.subtitle' },
      },
      {
        path: '/cases/:slug',
        name: 'CaseDetail',
        component: () => import('@/pages/CaseDetailView.vue'),
      },
      // Phase 4: 资源中心 + 新闻
      {
        path: '/resources',
        name: 'Resources',
        component: () => import('@/pages/ResourceListView.vue'),
        meta: { title: 'resourcePage.title', description: 'resourcePage.subtitle' },
      },
      {
        path: '/resources/:slug',
        name: 'ResourceDetail',
        component: () => import('@/pages/ResourceDetailView.vue'),
      },
      {
        path: '/news',
        name: 'News',
        component: () => import('@/pages/NewsListView.vue'),
        meta: { title: 'news.title', description: 'news.subtitle' },
      },
      {
        path: '/news/:slug',
        name: 'NewsDetail',
        component: () => import('@/pages/NewsDetailView.vue'),
      },
      // Phase 5: 加入我们
      {
        path: '/careers',
        name: 'Careers',
        component: () => import('@/pages/CareersView.vue'),
        meta: { title: 'careers.title', description: 'careers.subtitle' },
      },
      {
        path: '/careers/campus',
        name: 'CampusCareers',
        component: () => import('@/pages/CampusCareersView.vue'),
        meta: { title: 'careers.campusSubtitle', description: 'careers.subtitle' },
      },
      {
        path: '/careers/social',
        name: 'SocialCareers',
        component: () => import('@/pages/SocialCareersView.vue'),
        meta: { title: 'careers.socialSubtitle', description: 'careers.subtitle' },
      },
      {
        path: '/careers/:id',
        name: 'JobDetail',
        component: () => import('@/pages/JobDetailView.vue'),
      },
      // Phase 6: 了解我们
      {
        path: '/about',
        name: 'About',
        component: () => import('@/pages/AboutView.vue'),
        meta: { title: 'about.title', description: 'about.subtitle' },
      },
      {
        path: '/about/team',
        name: 'Team',
        component: () => import('@/pages/TeamView.vue'),
        meta: { title: 'team.title', description: 'team.subtitle' },
      },
      {
        path: '/about/contact',
        name: 'Contact',
        component: () => import('@/pages/ContactView.vue'),
        meta: { title: 'contactPage.title', description: 'contactPage.subtitle' },
      },
      {
        path: '/about/partners',
        name: 'Partners',
        component: () => import('@/pages/PartnersView.vue'),
        meta: { title: 'partners.title', description: 'partners.subtitle' },
      },
      // 404 兜底
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/NotFoundView.vue'),
        meta: { title: 'notFound.title' },
      },
    ],
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
