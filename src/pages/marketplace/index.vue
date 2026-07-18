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
import { ref, computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { getMarketplaceApps, getMarketplaceCategories } from '@/data/marketplace';
import { marketplaceApi, transformMarketplaceApp, transformMarketplaceCategory, type MarketplaceApp, type MarketplaceCategory } from '@/api/marketplace';
import { useJsonLd } from '@/shared/utils/jsonld';
import sBase from './index.module.css';
import sFeatured from './index.featured.module.css';
import sCards from './index.cards.module.css';
import sCta from './index.cta.module.css';

// 类族按文件拆分（互不相交）。用 Proxy 回退链合并（不用展开运算符——
// vitest 将 CSS Module mock 为不可枚举的 Proxy，展开会丢失全部类名）
const s = new Proxy({}, {
  get: (_, key: string) =>
    (sBase as Record<string, string>)[key] ??
    (sFeatured as Record<string, string>)[key] ??
    (sCards as Record<string, string>)[key] ??
    (sCta as Record<string, string>)[key],
}) as typeof sBase;

const { t, locale } = useI18n();
const modalStore = useModalStore();

const activeCategory = ref('all');
const searchQuery = ref('');
const sortBy = ref('featured');

const iconMap = {
  users: '👥', 'dollar-sign': '💵', target: '🎯', 'book-open': '📖', heart: '❤️',
  shield: '🛡️', bot: '🤖', 'bar-chart-2': '📊', recruitment: '👥', compensation: '💵',
  performance: '🎯', learning: '📖', experience: '❤️', compliance: '🛡️', ai: '🤖', analytics: '📊',
};

const categoryIcon = (icon?: string) => (icon ? iconMap[icon as keyof typeof iconMap] || '•' : '•');

const { data: apiCategories } = useAsyncData('marketplace-categories', async () => {
  const res = await marketplaceApi.getCategories();
  const list = (res?.data?.data || res?.data || res || []) as any[];
  return list.map(transformMarketplaceCategory).filter((c) => c.slug);
}, { default: () => [] as MarketplaceCategory[] });

const { data: apiApps } = useAsyncData('marketplace-apps', async () => {
  const res = await marketplaceApi.getApps({ pageSize: 100 });
  const list = (res?.data?.data || res?.data || res || []) as any[];
  return list.map(transformMarketplaceApp);
}, { default: () => [] as MarketplaceApp[] });

const { data: apiFeatured } = useAsyncData('marketplace-featured', async () => {
  const res = await marketplaceApi.getFeaturedApps();
  const list = (res?.data || res || []) as any[];
  return list.map(transformMarketplaceApp);
}, { default: () => [] as MarketplaceApp[] });

const fallbackCategories = computed(() => getMarketplaceCategories(locale.value));
const fallbackApps = computed(() => getMarketplaceApps(locale.value));

const categoryList = computed<MarketplaceCategory[]>(() =>
  (apiCategories.value?.length ? apiCategories.value : fallbackCategories.value.map((c) => ({ id: c.id, slug: c.id, name: c.label, icon: c.icon }))) as MarketplaceCategory[]
);

const appList = computed<MarketplaceApp[]>(() =>
  apiApps.value?.length ? apiApps.value : fallbackApps.value as MarketplaceApp[]
);

const featuredList = computed<MarketplaceApp[]>(() =>
  apiFeatured.value?.length ? apiFeatured.value : (fallbackApps.value as MarketplaceApp[]).filter((a) => a.featured)
);

const categories = computed<Array<{ id: string; label: string; icon?: string }>>(() => [
  { id: 'all', label: t('common.all') },
  ...categoryList.value.map((c) => ({ id: c.slug || c.id, label: t(`marketplace.categories.${c.slug || c.id}`), icon: c.icon })),
]);

const filteredApps = computed(() => {
  let list = [...appList.value];
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
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name, locale.value)); break;
    default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.ratingAvg - a.ratingAvg); break;
  }
  return list.map((a, i) => ({ ...a, _stagger: i }));
});

const featuredApps = computed(() => featuredList.value.slice(0, 4));

const formatPricing = (model: string) => {
  const map = {
    free: t('marketplace.priceFree'),
    subscription: t('marketplace.priceSubscription'),
    one_time: t('marketplace.priceOneTime'),
    usage_based: t('marketplace.priceUsage'),
    freemium: t('marketplace.priceFreemium'),
    paid: t('marketplace.pricePaid'),
  };
  return map[model as keyof typeof map] || model;
};

const formatInstallCount = (n: number) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

useJsonLd(computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: t('marketplace.jsonLdName'),
  itemListElement: appList.value.slice(0, 8).map((app, i) => ({
    '@type': 'ListItem', position: i + 1, name: app.name, description: app.tagline,
  })),
})));
</script>
