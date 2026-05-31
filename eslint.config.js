import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
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
        useAsyncData: 'readonly',
        useLazyAsyncData: 'readonly',
        useFetch: 'readonly',
        useLazyFetch: 'readonly',
        useApiData: 'readonly',
        useApiList: 'readonly',
        useCmsPageAsync: 'readonly',
        useI18n: 'readonly',
      },
    },
    rules: {
      // 安全相关
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // Vue 规范
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'talentpro-backend/', 'talentpro-admin/'],
  },
];
