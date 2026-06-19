<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('marketplace.title'), to: '/marketplace' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('marketplace.title') }}</h1>
          <p :class="s.subtitle">{{ t('marketplace.subtitle') }}</p>
        </div>

        <div :class="s.toolbar" class="reveal reveal-delay-1">
          <div :class="s.searchWrap">
            <input v-model="searchQuery" type="text" :placeholder="t('marketplace.searchPlaceholder')" :class="s.searchInput" />
          </div>
          <div :class="s.sortWrap">
            <select v-model="sortBy" :class="s.sortSelect">
              <option value="featured">{{ t('marketplace.sortFeatured') }}</option>
              <option value="rating">{{ t('marketplace.sortRating') }}</option>
              <option value="installCount">{{ t('marketplace.sortPopular') }}</option>
              <option value="name">{{ t('marketplace.sortName') }}</option>
            </select>
          </div>
        </div>

        <div :class="s.categories" class="reveal reveal-delay-1">
          <button v-for="cat in categories" :key="cat.id" :class="[s.catBtn, activeCategory === cat.id ? s.catActive : '']" @click="activeCategory = cat.id">
            <span v-if="cat.icon" :class="s.catIcon">{{ categoryIcon(cat.icon) }}</span>
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <div :class="s.resultBar" class="reveal">
          <span v-if="searchQuery" :class="s.resultText">{{ t('marketplace.resultsFor') }} “{{ searchQuery }}”：{{ filteredApps.length }} {{ t('marketplace.items') }}</span>
          <span v-else :class="s.resultText">{{ t('marketplace.showing') }} {{ filteredApps.length }} {{ t('marketplace.items') }}</span>
        </div>

        <div v-if="featuredApps.length" :class="s.featured" class="reveal">
          <h2 :class="s.featuredTitle">{{ t('marketplace.featured') }}</h2>
          <div :class="s.featuredGrid">
            <NuxtLink v-for="app in featuredApps" :key="app.id" :to="`/marketplace/${app.slug}`" :class="s.featuredCard">
              <div :class="s.featuredIcon">{{ app.name.charAt(0) }}</div>
              <div :class="s.featuredInfo">
                <h3 :class="s.featuredCardTitle">{{ app.name }}</h3>
                <p :class="s.featuredTagline">{{ app.tagline }}</p>
                <div :class="s.featuredMeta">
                  <span :class="s.rating">★ {{ app.ratingAvg }}</span>
                  <span>{{ formatPricing(app.pricingModel) }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div :class="s.grid" class="reveal">
          <NuxtLink v-for="(app, i) in filteredApps" :key="app.id" :to="`/marketplace/${app.slug}`" :class="s.card" :style="{ '--stagger': i }">
            <div :class="s.cardHeader">
              <div :class="s.cardIcon">{{ app.name.charAt(0) }}</div>
              <div :class="s.cardMeta">
                <span v-if="app.featured" :class="s.cardBadge">{{ t('marketplace.featured') }}</span>
                <span :class="s.pricingBadge">{{ formatPricing(app.pricingModel) }}</span>
              </div>
            </div>
            <h3 :class="s.cardTitle">{{ app.name }}</h3>
            <p :class="s.cardTagline">{{ app.tagline }}</p>
            <p :class="s.cardDesc">{{ app.description.slice(0, 80) }}...</p>
            <div :class="s.cardFooter">
              <span :class="s.cardVendor">{{ app.vendor }}</span>
              <span :class="s.cardRating">★ {{ app.ratingAvg }} · {{ formatInstallCount(app.installCount) }}</span>
            </div>
          </NuxtLink>
        </div>

        <div v-if="filteredApps.length === 0" :class="s.empty">{{ t('marketplace.noResults') }}</div>

        <div :class="s.ctaBand" class="reveal">
          <h3 :class="s.ctaTitle">{{ t('marketplace.ctaTitle') }}</h3>
          <p :class="s.ctaDesc">{{ t('marketplace.ctaDesc') }}</p>
          <button :class="s.ctaBtn" @click="modalStore.openModal()">{{ t('marketplace.demoCta') }}</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'marketplace.title', description: 'marketplace.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { MARKETPLACE_APPS, MARKETPLACE_CATEGORIES } from '@/data/marketplace.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './index.vue.module.css';

const { t } = useI18n();
const modalStore = useModalStore();

const activeCategory = ref('all');
const searchQuery = ref('');
const sortBy = ref('featured');

const iconMap = {
  users: '👥', 'dollar-sign': '💵', target: '🎯', 'book-open': '📖', heart: '❤️',
  shield: '🛡️', bot: '🤖', 'bar-chart-2': '📊', recruitment: '👥', compensation: '💵',
  performance: '🎯', learning: '📖', experience: '❤️', compliance: '🛡️', ai: '🤖', analytics: '📊',
};

const categoryIcon = (icon) => iconMap[icon] || '•';

const categories = computed(() => [
  { id: 'all', label: t('common.all') },
  ...MARKETPLACE_CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
]);

const filteredApps = computed(() => {
  let list = [...MARKETPLACE_APPS];
  if (activeCategory.value !== 'all') list = list.filter((a) => a.category === activeCategory.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.vendor.toLowerCase().includes(q)
    );
  }
  switch (sortBy.value) {
    case 'rating': list.sort((a, b) => b.ratingAvg - a.ratingAvg); break;
    case 'installCount': list.sort((a, b) => b.installCount - a.installCount); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'zh')); break;
    default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.ratingAvg - a.ratingAvg); break;
  }
  return list.map((a, i) => ({ ...a, _stagger: i }));
});

const featuredApps = computed(() => MARKETPLACE_APPS.filter((a) => a.featured).slice(0, 4));

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

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('marketplace.jsonLdName'),
    itemListElement: MARKETPLACE_APPS.slice(0, 8).map((app, i) => ({
      '@type': 'ListItem', position: i + 1, name: app.name, description: app.tagline,
    })),
  });
});
onUnmounted(removeJsonLd);
</script>
