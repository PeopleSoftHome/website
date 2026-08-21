import { defineNuxtConfig } from 'nuxt/config';
import { getBlogPosts } from './src/data/blog';
import { getCases } from './src/data/cases';
import { getNewsArticles } from './src/data/news';
import { getResources } from './src/data/resources';
import { getMarketplaceApps } from './src/data/marketplace';
import { getIndustryMap } from './src/data/industries/map';
import { getForumTopics } from './src/data/forum';
import { getJobs } from './src/data/jobs';

function buildPrerenderRoutes(): string[] {
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
  srcDir: 'src',
  ssr: true,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'development',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      assetBaseUrl: process.env.NUXT_PUBLIC_ASSET_BASE_URL || '/',
    },
  },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@vite-pwa/nuxt', '@nuxt/image'],
  css: [
    '~/styles/global.css',
    '~/styles/design-tokens-v2.css',
    '~/styles/animations.css',
    '~/styles/reveal.css',
  ],
  imports: {
    dirs: ['composables', 'stores', 'utils'],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  nitro: {
    preset: 'static',
    prerender: {
      routes: buildPrerenderRoutes(),
      crawlLinks: true,
    },
    compressPublicAssets: false,
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/icon-*.png': { headers: { 'cache-control': 'public, max-age=86400' } },
      '/sw.js': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
      '/manifest.webmanifest': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
    },
  },
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
      globPatterns: ['offline.html', 'icon-*.png', '**/*.{js,css}'],
      navigateFallback: '/offline.html',
      navigateFallbackDenylist: [/^\/api\//, /^\/.well-known/],
      runtimeCaching: [
        {
          urlPattern: /.*\/fonts\/.*\.(woff2?|ttf|otf)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'local-fonts-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
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
  vite: {
    build: {
      sourcemap: process.env.SOURCE_MAP === 'true',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-utils': ['axios', '@sentry/vue'],
            'vendor-i18n': ['vue-i18n'],
            'vendor-markdown': ['marked', 'dompurify'],
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
  devServer: {
    port: 8080,
  },
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === 'production',
  },
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
