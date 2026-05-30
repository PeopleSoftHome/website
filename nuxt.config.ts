import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  // ── 源码目录 ──
  srcDir: 'src',

  // ── 渲染模式 ──
  // 开发：SPA 模式（减少开发摩擦）
  // 生产构建：由 nitro.preset 控制，当前使用 static（SSG）
  ssr: false,

  // ── 运行时配置 ──
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      assetBaseUrl: process.env.NUXT_PUBLIC_ASSET_BASE_URL || '/',
    },
  },

  // ── 模块 ──
  modules: [
    '@pinia/nuxt',
    // '@nuxtjs/i18n', // TODO: 迭代 5 中完整迁移 i18n
    '@vite-pwa/nuxt',
  ],

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
      routes: ['/'],
      crawlLinks: true,
    },
  },

  // ── i18n ──
  i18n: {
    locales: [
      { code: 'zh', name: '简体中文', file: 'zh-CN.json', iso: 'zh-CN' },
      { code: 'en', name: 'English', file: 'en.json', iso: 'en' },
      { code: 'zh-TW', name: '繁體中文', file: 'zh-TW.json', iso: 'zh-TW' },
    ],
    defaultLocale: 'zh',
    langDir: 'i18n/locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tp-locale',
      redirectOn: 'root',
    },
    vueI18n: './i18n.config.ts',
  },

  // ── PWA ──
  pwa: {
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
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      navigateFallback: '/offline.html',
      navigateFallbackDenylist: [/^\/api\//, /^\/.well-known/],
      runtimeCaching: [
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
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      sourcemap: process.env.SOURCE_MAP === 'true',
      chunkSizeWarningLimit: 500,
    },
  },

  // ── 开发服务器 ──
  devServer: {
    port: 3000,
  },

  // ── TypeScript ──
  typescript: {
    strict: false,
    typeCheck: false,
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
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
      ],
    },
  },
});
