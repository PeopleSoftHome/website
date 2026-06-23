import { watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cmsApi } from '@/api/cms';

/**
 * 将 CMS 翻译覆盖层合并到 vue-i18n
 * 后端返回扁平对象：{ 'nav.demo': '...', 'hero.title': '...' }
 * 这里按 . 拆分为嵌套对象后 mergeLocaleMessage
 */
function flatToNested(flat: Record<string, string>): Record<string, unknown> {
  const nested: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cursor: Record<string, unknown> = nested;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i] as string;
      if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1] as string] = value;
  }
  return nested;
}

export function useCmsTranslations() {
  const { locale, mergeLocaleMessage } = useI18n();

  const load = async (loc: string) => {
    if (!loc || typeof window === 'undefined') return;
    try {
      const { data } = await cmsApi.getTranslations(loc, undefined);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        mergeLocaleMessage(loc, flatToNested(data as Record<string, string>));
      }
    } catch (e) {
      const err = e as Error;
      if (import.meta.env.DEV) {
        console.warn('[useCmsTranslations] failed to load CMS translations:', err?.message);
      }
    }
  };

  onMounted(() => load(locale.value as string));
  watch(locale, load);
}
