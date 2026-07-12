/**
 * usePageMetaSync — 语言/站点配置/路由变化时同步页面 Meta
 * 使用 useHead，保证 SSR/SSG 阶段即可输出 <title>、description、Open Graph 标签
 */
import { computed, watch } from 'vue';
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
  const pageTitle = computed(() => {
    const titleKey = route.meta?.title as string | undefined;
    if (titleKey) {
      const translated = t(titleKey);
      return translated.startsWith('TalentPro') ? translated : `TalentPro — ${translated}`;
    }
    return siteTitle?.value || 'TalentPro';
  });

  const pageDescription = computed(() => {
    const descKey = route.meta?.description as string | undefined;
    if (descKey) return t(descKey);
    return siteDescription?.value || '';
  });

  const canonicalOrigin = computed(() => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://talentpro.cn';
  });

  const canonicalUrl = computed(() => {
    return `${canonicalOrigin.value}${route.fullPath}`;
  });

  const headTitle = computed(() => pageTitle.value);
  const headMeta = computed(() => {
    const desc = pageDescription.value;
    const title = pageTitle.value;
    return [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl.value },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ];
  });

  useHead(() => ({
    title: headTitle.value,
    meta: headMeta.value,
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
  }));

  // 客户端切换语言/路由后，同步更新 document.title（useHead 已处理 SSR，此处兜底兼容旧逻辑）
  watch([locale, () => route.path, siteTitle, siteDescription], () => {
    if (typeof document !== 'undefined') {
      document.title = pageTitle.value;
    }
  });

  return { pageTitle, pageDescription };
}
