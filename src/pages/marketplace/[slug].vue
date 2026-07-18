<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('marketplace.title'), to: '/marketplace' },
          { label: app?.name || t('marketplace.detail') },
        ]" />

        <div v-if="app" :class="s.hero" class="reveal">
          <div :class="s.heroContent">
            <div :class="s.heroHeader">
              <div :class="s.appIcon">{{ app.name.charAt(0) }}</div>
              <div :class="s.heroInfo">
                <span :class="s.categoryBadge">{{ categoryLabel }}</span>
                <h1 :class="s.title">{{ app.name }}</h1>
                <p :class="s.tagline">{{ app.tagline }}</p>
              </div>
            </div>

            <div :class="s.heroMeta">
              <span :class="s.metaItem">
                <span :class="s.metaValue">★ {{ app.ratingAvg }}</span>
                <span :class="s.metaLabel">{{ app.ratingCount }}{{ t('marketplace.reviews') }}</span>
              </span>
              <span :class="s.metaItem">
                <span :class="s.metaValue">{{ formatInstallCount(app.installCount) }}</span>
                <span :class="s.metaLabel">{{ t('marketplace.installs') }}</span>
              </span>
              <span :class="s.metaItem">
                <span :class="s.metaValue">{{ formatPricing(app.pricingModel) }}</span>
                <span :class="s.metaLabel">{{ t('marketplace.pricing') }}</span>
              </span>
              <span :class="s.metaItem">
                <span :class="s.metaValue">{{ app.vendor }}</span>
                <span :class="s.metaLabel">{{ t('marketplace.vendor') }}</span>
              </span>
            </div>

            <div :class="s.heroActions">
              <button :class="s.ctaPrimary" @click="scrollToPricing">{{ t('marketplace.subscribe') }}</button>
              <button :class="s.ctaSecondary" @click="modalStore.openModal()">{{ t('marketplace.contactSales') }}</button>
            </div>
          </div>
        </div>

        <div v-if="app?.description" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.about') }}</h2>
          <p :class="s.desc">{{ app.description }}</p>
        </div>

        <div v-if="app?.features?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.features') }}</h2>
          <div :class="s.featureGrid">
            <div v-for="(f, i) in app.features" :key="i" :class="s.featureCard">
              <div :class="s.featureNum">0{{ i + 1 }}</div>
              <p :class="s.featureText">{{ f }}</p>
            </div>
          </div>
        </div>

        <div v-if="app?.screenshots?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.screenshots') }}</h2>
          <div :class="s.screenshots">
            <div v-for="(shot, i) in app.screenshots" :key="i" :class="s.shot">
              <div :class="s.shotSvg">
                <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="320" height="180" rx="8" fill="var(--gray-100)" />
                  <rect x="20" y="20" width="120" height="12" rx="4" fill="var(--gray-200)" />
                  <rect x="20" y="42" width="80" height="8" rx="4" fill="var(--gray-200)" />
                  <rect x="20" y="70" width="280" height="90" rx="6" fill="var(--primary-light)" opacity="0.4" />
                  <text x="160" y="125" text-anchor="middle" fill="var(--primary)" font-size="14" font-weight="600">Screenshot {{ i + 1 }}</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div v-if="app?.pricingTiers?.length" id="pricing" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.pricingPlans') }}</h2>
          <AppPricing :tiers="app.pricingTiers" :selected="selectedTier" @select="selectedTier = $event" @subscribe="handleSubscribe" @addToCart="handleAddToCart" @freeInstall="handleFreeInstall" />
        </div>

        <AppReviews :app-slug="slugStr" />

        <div v-if="app?.compatibility?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.compatibility') }}</h2>
          <div :class="s.compatibilityList">
            <span v-for="(c, i) in app.compatibility" :key="i" :class="s.compatibilityTag">{{ c }}</span>
          </div>
        </div>

        <div v-if="relatedApps.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.related') }}</h2>
          <div :class="s.relatedGrid">
            <NuxtLink v-for="ra in relatedApps" :key="ra.slug" :to="`/marketplace/${ra.slug}`" :class="s.relatedCard">
              <div :class="s.relatedIcon">{{ ra.name.charAt(0) }}</div>
              <span :class="s.relatedName">{{ ra.name }}</span>
              <span :class="s.relatedTagline">{{ ra.tagline }}</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="!app" :class="s.empty">{{ t('marketplace.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import AppPricing from '@/components/sections/Marketplace/AppPricing.vue';
import AppReviews from '@/components/sections/Marketplace/AppReviews.vue';
import { getMarketplaceApps, getMarketplaceAppMap, getMarketplaceCategories } from '@/data/marketplace';
import { marketplaceApi, paymentApi, cartApi, transformMarketplaceApp, type MarketplaceApp } from '@/api/marketplace';
import { showToast } from '@/utils/toast';
import { useJsonLd } from '@/shared/utils/jsonld';
import sBase from './[slug].module.css';
import sFeatures from './[slug].features.module.css';
import sPricing from './[slug].pricing.module.css';
import sRelated from './[slug].related.module.css';

// 类族按文件拆分（互不相交）。用 Proxy 回退链合并（不用展开运算符——
// vitest 将 CSS Module mock 为不可枚举的 Proxy，展开会丢失全部类名）
const s = new Proxy({}, {
  get: (_, key: string) =>
    (sBase as Record<string, string>)[key] ??
    (sFeatures as Record<string, string>)[key] ??
    (sPricing as Record<string, string>)[key] ??
    (sRelated as Record<string, string>)[key],
}) as typeof sBase;

definePageMeta({ title: 'marketplace.detail', description: 'marketplace.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const slugStr = computed(() => Array.isArray(slug.value) ? slug.value[0] : slug.value);
const modalStore = useModalStore();

const fallbackAppMap = computed(() => getMarketplaceAppMap(locale.value));
const fallbackCategories = computed(() => getMarketplaceCategories(locale.value));

const { data: apiApp } = useAsyncData(
  () => `marketplace-app-${slugStr.value}-${locale.value}`,
  async () => {
    if (!slugStr.value) return null;
    const res = await marketplaceApi.getApp(slugStr.value);
    return transformMarketplaceApp(res?.data || res);
  },
  { default: () => null as MarketplaceApp | null, watch: [slugStr, locale] }
);

const { data: apiApps } = useAsyncData(
  () => `marketplace-apps-all-${locale.value}`,
  async () => {
    const res = await marketplaceApi.getApps({ pageSize: 100 });
    const list = (res?.data?.data || res?.data || res || []) as any[];
    return list.map(transformMarketplaceApp);
  },
  { default: () => [] as MarketplaceApp[] }
);

const app = computed(() => apiApp.value || (fallbackAppMap.value as Record<string, MarketplaceApp>)[slugStr.value || ''] || null);
const selectedTier = ref(0);

const categoryLabel = computed(() => {
  const current = app.value;
  if (!current) return '';
  const catId = current.category;
  const cat = fallbackCategories.value.find((c) => c.id === catId);
  return cat ? t(`marketplace.categories.${catId}`) : catId;
});

useHead(() => {
  if (!app.value) return {};
  return {
    title: `${app.value.name} | ${t('marketplace.title')}`,
    meta: [
      { name: 'description', content: app.value.tagline },
      { property: 'og:title', content: app.value.name },
      { property: 'og:description', content: app.value.tagline },
    ],
  };
});

const formatPricing = (model: string) => {
  const map: Record<string, string> = {
    free: t('marketplace.priceFree'),
    subscription: t('marketplace.priceSubscription'),
    one_time: t('marketplace.priceOneTime'),
    usage_based: t('marketplace.priceUsage'),
    freemium: t('marketplace.priceFreemium'),
    paid: t('marketplace.pricePaid'),
  };
  return map[model] || model;
};

const formatInstallCount = (n: number) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const scrollToPricing = () => {
  if (typeof document === 'undefined') return;
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
};

const handleFreeInstall = async () => {
  if (!app.value) return;
  try {
    await marketplaceApi.installApp(slugStr.value);
    showToast(t('marketplace.installSuccess'), 'success');
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('marketplace.installError'), 'error');
  }
};

const handleAddToCart = async (tier: { name: string; priceMonthly: number }) => {
  if (!app.value) return;
  try {
    await cartApi.addItem({
      appId: app.value.id,
      slug: app.value.slug,
      name: app.value.name,
      tierName: tier.name,
      price: tier.priceMonthly,
      currency: 'CNY',
      quantity: 1,
    });
    showToast(t('marketplace.addToCartSuccess'), 'success');
    setTimeout(() => navigateTo('/marketplace/cart'), 600);
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('marketplace.addToCartError'), 'error');
  }
};

const handleSubscribe = async (tier: { name: string; priceMonthly: number }) => {
  if (!app.value) return;
  try {
    const orderRes = await paymentApi.createOrder({
      appId: app.value.id,
      tierName: tier.name,
      amount: tier.priceMonthly,
      currency: 'CNY',
      provider: 'STRIPE',
    });
    const order = orderRes.data;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://talentpro.cn';
    const checkoutRes = await paymentApi.createStripeCheckout({
      orderId: order.id,
      successUrl: `${origin}/marketplace/payment/success?order_id=${order.id}`,
      cancelUrl: `${origin}/marketplace/payment/cancel?order_id=${order.id}`,
    });
    if (checkoutRes.data?.url) {
      if (typeof window !== 'undefined') window.location.href = checkoutRes.data.url;
    }
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    showToast(err.response?.data?.message || t('marketplace.paymentError'), 'error');
  }
};

const relatedApps = computed(() => {
  const current = app.value;
  if (!current) return [];
  const fallbackList = getMarketplaceApps(locale.value) as MarketplaceApp[];
  const list = apiApps.value?.length ? apiApps.value : fallbackList;
  return list.filter((a) => a.category === current.category && a.slug !== current.slug).slice(0, 3);
});

useJsonLd(computed(() => {
  const val = app.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: val.name,
    description: val.tagline,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: val.pricingTiers?.map((t) => ({ '@type': 'Offer', name: t.name, price: t.priceMonthly, priceCurrency: 'CNY' })) || [],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: val.ratingAvg, ratingCount: val.ratingCount },
  };
}));
</script>
