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

        <AppReviews :app-slug="String(slug.value)" />

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

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import AppPricing from '@/components/sections/Marketplace/AppPricing.vue';
import AppReviews from '@/components/sections/Marketplace/AppReviews.vue';
import { MARKETPLACE_APPS, MARKETPLACE_APP_MAP, MARKETPLACE_CATEGORIES } from '@/data/marketplace.js';
import { marketplaceApi, paymentApi, cartApi } from '@/api/marketplace.js';
import { showToast } from '@/utils/toast.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'marketplace.detail', description: 'marketplace.subtitle' });

const { t } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const modalStore = useModalStore();

const app = computed(() => MARKETPLACE_APP_MAP[slug.value] || null);
const selectedTier = ref(0);

const categoryLabel = computed(() => {
  if (!app.value) return '';
  const cat = MARKETPLACE_CATEGORIES.find((c) => c.id === app.value.category);
  return cat?.label || app.value.category;
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

const formatPricing = (model) => {
  const map = {
    free: t('marketplace.priceFree'),
    subscription: t('marketplace.priceSubscription'),
    one_time: t('marketplace.priceOneTime'),
    usage_based: t('marketplace.priceUsage'),
    freemium: t('marketplace.priceFreemium'),
    paid: t('marketplace.pricePaid'),
  };
  return map[model] || model;
};

const formatInstallCount = (n) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const scrollToPricing = () => {
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
};

const handleFreeInstall = async () => {
  try {
    await marketplaceApi.installApp(slug.value);
    showToast(t('marketplace.installSuccess'), 'success');
  } catch (e) {
    showToast(e.response?.data?.message || t('marketplace.installError'), 'error');
  }
};

const handleAddToCart = async (tier) => {
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
  } catch (e) {
    showToast(e.response?.data?.message || t('marketplace.addToCartError'), 'error');
  }
};

const handleSubscribe = async (tier) => {
  try {
    const orderRes = await paymentApi.createOrder({
      appId: app.value.id,
      tierName: tier.name,
      amount: tier.priceMonthly,
      currency: 'CNY',
      provider: 'STRIPE',
    });
    const order = orderRes.data;
    const checkoutRes = await paymentApi.createStripeCheckout({
      orderId: order.id,
      successUrl: `${window.location.origin}/marketplace/payment/success?order_id=${order.id}`,
      cancelUrl: `${window.location.origin}/marketplace/payment/cancel?order_id=${order.id}`,
    });
    if (checkoutRes.data?.url) {
      window.location.href = checkoutRes.data.url;
    }
  } catch (e) {
    showToast(e.response?.data?.message || t('marketplace.paymentError'), 'error');
  }
};

const relatedApps = computed(() => {
  if (!app.value) return [];
  return MARKETPLACE_APPS.filter((a) => a.category === app.value.category && a.slug !== app.value.slug).slice(0, 3);
});

onMounted(() => {
  watch(app, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: val.name,
        description: val.tagline,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: val.pricingTiers?.map((t) => ({ '@type': 'Offer', name: t.name, price: t.priceMonthly, priceCurrency: 'CNY' })) || [],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: val.ratingAvg, ratingCount: val.ratingCount },
      });
    }
  }, { immediate: true });
});
onUnmounted(removeJsonLd);
</script>
