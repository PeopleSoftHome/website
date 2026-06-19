import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

const nuxtGlobals = {
  ...globals.browser,
  ...globals.node,
  // Nuxt 3 运行时全局 API
  useState: 'readonly',
  definePageMeta: 'readonly',
  defineNuxtRouteMiddleware: 'readonly',
  useNuxtApp: 'readonly',
  navigateTo: 'readonly',
  abortNavigation: 'readonly',
  useRoute: 'readonly',
  useRouter: 'readonly',
  useHead: 'readonly',
  useSeoMeta: 'readonly',
  useRuntimeConfig: 'readonly',
  useAsyncData: 'readonly',
  useFetch: 'readonly',
  useLazyFetch: 'readonly',
  useLazyAsyncData: 'readonly',
  defineNuxtConfig: 'readonly',
  defineNuxtPlugin: 'readonly',
  createError: 'readonly',
  useApiData: 'readonly',
  useApiList: 'readonly',
  useCmsPageAsync: 'readonly',
  useAuthStore: 'readonly',
  useI18n: 'readonly',
  onMounted: 'readonly',
  process: 'readonly',
  API_BASE_URL: 'readonly',
};

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nuxtGlobals,
    },
    rules: {
      // 安全相关
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // Vue 规范
      'vue/multi-word-component-names': 'off',
      // Nuxt 3 <script setup> 自动导入导致大量误报；TS 类型检查已覆盖未定义/未使用
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    files: ['**/*.{test,spec}.{js,ts}'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'talentpro-backend/', 'talentpro-admin/'],
  },
];
