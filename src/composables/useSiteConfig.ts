import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { systemApi } from '@/api/system.js';

export interface SocialLink {
  icon?: string;
  href?: string;
  label?: string;
  ariaLabel?: string;
  [key: string]: unknown;
}

interface SiteConfig {
  sitePhone?: string;
  copyright?: string;
  featureFlags?: Record<string, unknown>;
  hotTags?: string[];
  socialLinks?: SocialLink[];
  siteTitle?: string;
  siteDescription?: string;
  [key: string]: unknown;
}

/**
 * 站点级公开配置（由后端 /system/config/public 驱动）
 * 包含：recaptchaSiteKey、sentryDsn、sitePhone、copyright、featureFlags、hotTags、socialLinks、siteTitle、siteDescription 等
 * 请求一次后全局缓存，避免每个组件重复调用。
 */
const config: Ref<SiteConfig | null> = ref(null);
const loading = ref(false);
let promise: Promise<void> | null = null;

export function useSiteConfig() {
  if (!promise && config.value === null) {
    loading.value = true;
    promise = systemApi
      .getPublicConfig()
      .then((res) => {
        config.value = (res?.data ?? res ?? {}) as SiteConfig;
      })
      .catch(() => {
        config.value = {};
      })
      .finally(() => {
        loading.value = false;
      });
  }

  const sitePhone = computed(() => config.value?.sitePhone || '');
  const copyright = computed(() => config.value?.copyright || '');
  const featureFlags = computed(() => config.value?.featureFlags || {});
  const hotTags = computed(() => Array.isArray(config.value?.hotTags) ? config.value.hotTags : []);
  const socialLinks = computed(() => Array.isArray(config.value?.socialLinks) ? config.value.socialLinks : []);
  const siteTitle = computed(() => config.value?.siteTitle || '');
  const siteDescription = computed(() => config.value?.siteDescription || '');

  return {
    config,
    loading,
    sitePhone,
    copyright,
    featureFlags,
    hotTags,
    socialLinks,
    siteTitle,
    siteDescription,
  };
}
