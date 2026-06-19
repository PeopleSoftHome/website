/**
 * usePageMetaSync — 语言/站点配置变化时同步 document.title 与 meta description
 * 仅在客户端生效
 */
import { watch } from 'vue';
import type { Ref } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

type TranslateFn = (key: string) => string;

interface PageMetaSyncOptions {
  route: RouteLocationNormalizedLoaded;
  locale: Ref<string>;
  siteTitle?: Ref<string>;
  siteDescription?: Ref<string>;
  t: TranslateFn;
}

export function usePageMetaSync({ route, locale, siteTitle, siteDescription, t }: PageMetaSyncOptions) {
  const syncPageMeta = () => {
    if (typeof document === 'undefined') return;

    const titleKey = route.meta?.title as string | undefined;
    if (titleKey) {
      const translated = t(titleKey);
      document.title = translated.startsWith('TalentPro')
        ? translated
        : `TalentPro — ${translated}`;
    } else if (siteTitle?.value) {
      document.title = siteTitle.value;
    }

    const descKey = route.meta?.description as string | undefined;
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) return;

    if (descKey) {
      meta.setAttribute('content', t(descKey));
    } else if (siteDescription?.value) {
      meta.setAttribute('content', siteDescription.value);
    }
  };

  watch(locale, syncPageMeta);
  watch([siteTitle, siteDescription], syncPageMeta);

  return { syncPageMeta };
}
