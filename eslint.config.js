import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
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

const unusedOptions = {
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
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
      // JS 文件启用基础规则；TS/Vue 在下方覆盖为 @typescript-eslint 版本
      'no-undef': 'error',
      'no-unused-vars': ['error', unusedOptions],
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // 关闭与 TS 解析器冲突的基础规则，改用 TS 版本
      // TS 类型系统本身已覆盖未定义检查，避免基础 no-undef 在类型导入上的误报
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', unusedOptions],
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
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'talentpro-backend/', 'talentpro-admin/'],
  },
];
