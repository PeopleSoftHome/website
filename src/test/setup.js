/**
 * Vitest 全局 setup — 为组件测试提供 Nuxt / i18n / DOM mock
 */
import { vi } from 'vitest';
import { ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { config } from '@vue/test-utils';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    zh: {},
    en: {},
    'zh-TW': {},
  },
  missing: (locale, key) => key,
});

// 为 @vue/test-utils 的 mount 全局注入 i18n 插件
config.global.plugins = [i18n];

// Mock localStorage
const store = new Map();
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => store.get(key) ?? null),
  setItem: vi.fn((key, val) => store.set(key, val)),
  removeItem: vi.fn((key) => store.delete(key)),
  clear: vi.fn(() => store.clear()),
});

// Mock definePageMeta（Nuxt 页面宏）
vi.stubGlobal('definePageMeta', vi.fn());

// Mock Nuxt composables
vi.stubGlobal('useAsyncData', vi.fn((key, fetcher) => {
  const data = ref(null);
  const pending = ref(true);
  const error = ref(null);
  Promise.resolve().then(async () => {
    try {
      data.value = await fetcher();
    } catch (e) {
      error.value = e;
    } finally {
      pending.value = false;
    }
  });
  return { data, pending, error, refresh: vi.fn() };
}));

vi.stubGlobal('useRoute', vi.fn(() => ref({ params: {}, query: {}, meta: {} })));
vi.stubGlobal('useRouter', vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })));
vi.stubGlobal('useHead', vi.fn());
