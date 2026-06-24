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
      routes: ['/'],
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
    build: {
      sourcemap: process.env.SOURCE_MAP === 'true',
      chunkSizeWarningLimit: 150,
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
          content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 https://*.sentry.io; frame-src 'none'; object-src 'none'; base-uri 'self';",
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
      ],
    },
  },
});