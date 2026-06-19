import { watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cmsApi } from '@/api/cms.js';

/**
 * 将 CMS 翻译覆盖层合并到 vue-i18n
 * 后端返回扁平对象：{ 'nav.demo': '...', 'hero.title': '...' }
 * 这里按 . 拆分为嵌套对象后 mergeLocaleMessage
 */
function flatToNested(flat) {
  const nested = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cursor = nested;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return nested;
}

export function useCmsTranslations() {
  const { locale, mergeLocaleMessage } = useI18n();

  const load = async (loc) => {
    if (!loc || typeof window === 'undefined') return;
    try {
      const { data } = await cmsApi.getTranslations(loc);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        mergeLocaleMessage(loc, flatToNested(data));
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[useCmsTranslations] failed to load CMS translations:', e?.message);
      }
    }
  };

  onMounted(() => load(locale.value));
  watch(locale, load);
}
