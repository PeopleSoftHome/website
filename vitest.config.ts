import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import autoImport from 'unplugin-auto-import/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    autoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'vue-i18n': ['useI18n'],
        },
      ],
      dts: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.nuxt'],
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15000,
    maxWorkers: 2,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        '.nuxt',
        'src/test/**',
        '**/*.test.js',
        '**/*.module.css',
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 40,
          functions: 50,
          lines: 65,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      '#imports': resolve(__dirname, 'src/test/imports-stub.ts'),
    },
  },
});
