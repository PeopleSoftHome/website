import { defineNuxtConfig } from 'nuxt/config';
import { getBlogPosts } from './src/data/blog';
import { getCases } from './src/data/cases';
import { getNewsArticles } from './src/data/news';
import { getResources } from './src/data/resources';
import { getMarketplaceApps } from './src/data/marketplace';
import { getIndustryMap } from './src/data/industries/map';
import { getForumTopics } from './src/data/forum';
import { getJobs } from './src/data/jobs';

/**
 * 构建动态路由全量预渲染列表
 * 优先使用 src/data/ 静态 fallback 数据，不依赖后端 API
 * 兼容 i18n prefix_except_default 策略：zh 无前缀，en / zh-TW 有前缀
 */
function buildPrerenderRoutes(): string[] {
  // products/list.ts 顶层导入 Vue 组件，无法在 Node 构建期直接导入；
  // slug 列表由 lightweight 产品数据推导，与 list.ts 保持一致
  const PRODUCT_SLUGS = [
    'recruit', 'performance', 'org', 'attendance', 'payroll', 'learning', 'talent', 'analytics',
    'ai-recruit', 'ai-interview', 'ai-coach', 'ai-course',
    'assess-recruit', 'assess-360', 'assess-exam', 'assess-model',
    'paas-lowcode', 'paas-api', 'paas-eco', 'paas-sec',
  ];

  const locales = [
    { code: 'zh', prefix: '' },
    { code: 'en', prefix: '/en' },
    { code: 'zh-TW', prefix: '/zh-TW' },
  ];

  const routes: string[] = [];

  for (const { code, prefix } of locales) {
    const dataLocale = code === 'en' ? 'en' : 'zh';

    getBlogPosts(dataLocale).forEach((p) => routes.push(`${prefix}/blog/${p.slug}`));
    getCases(dataLocale).forEach((c) => routes.push(`${prefix}/cases/${c.slug}`));
    getNewsArticles(dataLocale).forEach((n) => routes.push(`${prefix}/news/${n.slug}`));
    getResources(dataLocale).forEach((r) => routes.push(`${prefix}/resources/${r.slug}`));
    getMarketplaceApps(dataLocale).forEach((app) => routes.push(`${prefix}/marketplace/${app.slug}`));
    Object.keys(getIndustryMap(dataLocale)).forEach((slug) => routes.push(`${prefix}/solutions/${slug}`));
    PRODUCT_SLUGS.forEach((slug) => routes.push(`${prefix}/products/${slug}`));
    getForumTopics(dataLocale).forEach((t) => routes.push(`${prefix}/forum/topic/${t.id}`));
    getJobs(dataLocale).forEach((j) => routes.push(`${prefix}/careers/${j.id}`));
  }

  return routes;
}

function getApiOrigin(): string {
  try {
    return new URL(process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1').origin;
  } catch {
    return 'http://localhost:4000';
  }
}

function buildCsp(): string {
  const appEnv = process.env.NUXT_PUBLIC_APP_ENV || 'development';
  const apiOrigin = getApiOrigin();
  const connectSrc = new Set(["'self'", apiOrigin]);
  if (appEnv === 'development') {
    connectSrc.add('http://localhost:4000');
    connectSrc.add('http://127.0.0.1:4000');
  }
  const sentryDsn = process.env.NUXT_PUBLIC_SENTRY_DSN || '';
  if (sentryDsn) {
    try {
      connectSrc.add(new URL(sentryDsn).origin);
    } catch {
      // ignore invalid DSN
    }
  }
  return `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src ${Array.from(connectSrc).join(' ')}; frame-src 'none'; object-src 'none'; base-uri 'self';`;
}

export default defineNuxtConfig({
  // ── 源码目录 ──
  srcDir: 'src',

  // ── 渲染模式 ──
  // 生产构建使用 static preset 生成真实 SSG；开发同样走 SSR 渲染，
  // 保证 SSR 不兼容代码在开发阶段即可暴露。
  ssr: true,

  // ── 运行时配置 ──
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'development',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      assetBaseUrl: process.env.NUXT_PUBLIC_ASSET_BASE_URL || '/',
    },
  },

  // ── 模块 ──
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@vite-pwa/nuxt', '@nuxt/image'],

  // ── CSS ──
  css: [
    '~/styles/global.css',
    '~/styles/animations.css',
    '~/styles/reveal.css',
  ],

  // ── 自动导入 ──
  imports: {
    dirs: [
      'composables',
      'stores',
      'utils',
    ],
  },

  // ── 组件自动导入 ──
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // ── Nitro 预设 ──
  nitro: {
    preset: 'static',
    prerender: {
      routes: buildPrerenderRoutes(),
      crawlLinks: true,
    },
    // 注：Nuxt 4 + static preset + Windows 下 compressPublicAssets 与资源复制存在竞态，
    // 导致构建偶尔/必然 ENOENT。由 CDN/Nginx 统一压缩，关闭 Nitro 内置压缩。
    compressPublicAssets: false,
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/icon-*.png': { headers: { 'cache-control': 'public, max-age=86400' } },
      '/sw.js': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
      '/manifest.webmanifest': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
    },
  },

  // ── 图片优化 ──
  image: {
    quality: 80,
    format: ['webp', 'jpg', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  // ── i18n ──
  i18n: {
    restructureDir: '.',
    locales: [
      { code: 'zh', name: '简体中文', file: 'zh-CN.json', iso: 'zh-CN' },
      { code: 'en', name: 'English', file: 'en.json', iso: 'en' },
      { code: 'zh-TW', name: '繁體中文', file: 'zh-TW.json', iso: 'zh-TW' },
    ],
    defaultLocale: 'zh',
    langDir: 'src/i18n/locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tp-locale',
      redirectOn: 'root',
    },
    vueI18n: 'i18n.config.ts',
    compilation: {
      strictMessage: false,
    },
  },

  // ── PWA ──
  // 开发模式禁用 Service Worker，避免 SW 安装/更新与缓存清理带来的额外开销。
  pwa: {
    disable: process.env.NODE_ENV !== 'production',
    registerType: 'autoUpdate',
    manifest: {
      name: 'TalentPro HR Portal',
      short_name: 'TalentPro',
      lang: 'zh-CN',
      description: 'TalentPro 为中大型企业提供一体化 HR SaaS、测评与人才管理、全场景 AI Agent 解决方案',
      theme_color: '#1B5FEB',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      // 仅预缓存核心资源，避免全部 HTML 页面进入 precache 导致首次 SW 安装过大。
      globPatterns: ['offline.html', 'icon-*.png', '**/*.{js,css}'],
      navigateFallback: '/offline.html',
      navigateFallbackDenylist: [/^\/api\//, /^\/.well-known/],
      runtimeCaching: [
        {
          // 本地字体运行时缓存
          urlPattern: /.*\/fonts\/.*\.(woff2?|ttf|otf)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'local-fonts-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 页面 HTML 运行时缓存，首次访问后支持离线
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'pages-cache',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  },

  // ── Vite 配置迁移 ──
  vite: {
    build: {
      sourcemap: process.env.SOURCE_MAP === 'true',
      // SSG 入口 chunk 包含全站路由预加载映射，405KB 属于 manifest 级别开销；
      // 将告警阈值提高到 500KB，避免误报，同时通过 manualChunks 拆分第三方库。
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-utils': ['axios', '@sentry/vue', 'dompurify', 'marked'],
            'vendor-i18n': ['vue-i18n'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'axios',
        'vue',
        'vue-router',
        'pinia',
        '@sentry/vue',
        'dompurify',
        'marked',
      ],
    },
  },

  // ── 开发服务器 ──
  devServer: {
    port: 8080,
  },

  // ── TypeScript ──
  // 生产构建保留类型检查；开发模式关闭 typeCheck，避免 vue-tsc 拖慢 HMR 与启动。
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === 'production',
  },

  // ── 应用配置 ──
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TalentPro 为中大型企业提供一体化 HR SaaS、测评与人才管理、全场景 AI Agent 解决方案' },
        {
          'http-equiv': 'Content-Security-Policy',
          content: buildCsp(),
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
      ],
    },
  },
});