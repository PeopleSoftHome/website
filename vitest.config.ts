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
    include: ['src/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.nuxt'],
    setupFiles: ['./src/test/setup.js'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
    },
  },
});
