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
              <button :class="s.ctaPrimary" @click="scrollToPricing">
                {{ t('marketplace.subscribe') }}
              </button>
              <button :class="s.ctaSecondary" @click="modalStore.openModal()">
                {{ t('marketplace.contactSales') }}
              </button>
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

        <div v-if="app?.pricingTiers?.length" id="pricing" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.pricingPlans') }}</h2>
          <div :class="s.pricingGrid">
            <div
              v-for="(tier, i) in app.pricingTiers"
              :key="i"
              :class="[s.pricingCard, selectedTier === i ? s.pricingCardHighlight : '']"
              @click="selectedTier = i"
            >
              <h3 :class="s.pricingName">{{ tier.name }}</h3>
              <div :class="s.pricingPrice">
                <span v-if="tier.priceMonthly === 0" :class="s.priceFree">{{ t('marketplace.priceFree') }}</span>
                <template v-else>
                  <span :class="s.priceCurrency">¥</span>
                  <span :class="s.priceValue">{{ tier.priceMonthly }}</span>
                  <span :class="s.priceUnit">/ {{ t('marketplace.month') }}</span>
                </template>
              </div>
              <p :class="s.pricingDesc">{{ tier.desc }}</p>
              <ul :class="s.pricingFeatures">
                <li v-for="(feat, j) in tier.features" :key="j" :class="s.pricingFeature">
                  ✓ {{ feat }}
                </li>
              </ul>
              <button
                v-if="tier.priceMonthly > 0"
                :class="[s.pricingBtn, selectedTier === i ? s.pricingBtnPrimary : '']"
                @click.stop="handleSubscribe(tier)"
              >
                {{ t('marketplace.subscribeNow') }}
              </button>
              <button
                v-else
                :class="[s.pricingBtn, s.pricingBtnPrimary]"
                @click.stop="handleFreeInstall"
              >
                {{ t('marketplace.freeInstall') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="app?.compatibility?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.compatibility') }}</h2>
          <div :class="s.compatibilityList">
            <span v-for="(c, i) in app.compatibility" :key="i" :class="s.compatibilityTag">
              {{ c }}
            </span>
          </div>
        </div>

        <div v-if="relatedApps.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('marketplace.related') }}</h2>
          <div :class="s.relatedGrid">
            <NuxtLink
              v-for="ra in relatedApps"
              :key="ra.slug"
              :to="`/marketplace/${ra.slug}`"
              :class="s.relatedCard"
            >
              <div :class="s.relatedIcon">{{ ra.name.charAt(0) }}</div>
              <span :class="s.relatedName">{{ ra.name }}</span>
              <span :class="s.relatedTagline">{{ ra.tagline }}</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="!app" :class="s.empty">
          {{ t('marketplace.notFound') }}
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { MARKETPLACE_APPS, MARKETPLACE_APP_MAP, MARKETPLACE_CATEGORIES } from '@/data/marketplace.js';
import { marketplaceApi, paymentApi } from '@/api/marketplace.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'marketplace.detail', description: 'marketplace.subtitle' });

const { t } = useI18n();
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });

const app = computed(() => MARKETPLACE_APP_MAP[route.params.slug] || null);
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
    free: t('marketplace.priceFree') || '免费',
    subscription: t('marketplace.priceSubscription') || '订阅制',
    one_time: t('marketplace.priceOneTime') || '一次性',
    usage_based: t('marketplace.priceUsage') || '按量计费',
    freemium: t('marketplace.priceFreemium') || '免费增值',
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
    await marketplaceApi.installApp(route.params.slug);
    alert(t('marketplace.installSuccess') || '安装成功！');
  } catch (e) {
    alert(e.response?.data?.message || t('marketplace.installError') || '安装失败，请登录后重试');
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
    alert(e.response?.data?.message || t('marketplace.paymentError') || '支付初始化失败');
  }
};

const relatedApps = computed(() => {
  if (!app.value) return [];
  return MARKETPLACE_APPS.filter(
    (a) => a.category === app.value.category && a.slug !== app.value.slug
  ).slice(0, 3);
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
        offers: val.pricingTiers?.map((t) => ({
          '@type': 'Offer',
          name: t.name,
          price: t.priceMonthly,
          priceCurrency: 'CNY',
        })) || [],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: val.ratingAvg,
          ratingCount: val.ratingCount,
        },
      });
    }
  }, { immediate: true });
});

onUnmounted(removeJsonLd);
</script>
