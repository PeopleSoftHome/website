<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{label:t('productPage.title'),to:'/products'},{label:product?.name||t('productPage.detail')}]" />

        <!-- Immersive Hero -->
        <div v-if="product" :class="s.hero" class="reveal" :style="{'--hero-tint':product.iconBg||'var(--primary)','--hero-tint-2':product.iconColor||'var(--primary)'}">
          <div :class="s.heroDecor" aria-hidden="true" />
          <div :class="s.heroContent">
            <span :class="s.tag">{{ product.tabLabel }}</span>
            <h1 :class="s.title">{{ product.name }}</h1>
            <p :class="s.tagline">{{ product.tagline }}</p>
            <p :class="s.desc">{{ product.desc }}</p>
            <div :class="s.heroActions">
              <button :class="s.ctaPrimary" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
              <NuxtLink v-if="product.url" :to="product.url" :class="s.ctaSecondary">{{ t('productPage.docCta') }}</NuxtLink>
            </div>
            <div v-if="product.awards?.length" :class="s.awardRow">
              <span v-for="(a, idx) in product.awards" :key="idx" :class="s.awardTag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
                {{ a }}
              </span>
            </div>
          </div>
          <div :class="s.heroVisual" :style="{background:product.iconBg||'var(--primary-light)',color:product.iconColor||'var(--primary)'}">
            <component :is="productIcon" v-if="productIcon" />
            <span v-else>{{ product.name.charAt(0) }}</span>
          </div>
        </div>

        <!-- Features -->
        <ProductFeatureCards v-if="product?.features?.length" :features="product.features" />

        <!-- Mid-page CTA -->
        <div :class="[s.section, s.ctaBanner]" class="reveal">
          <div :class="s.ctaBannerInner">
            <h3 :class="s.ctaBannerTitle">{{ t('productPage.ctaTitle') }}</h3>
            <p :class="s.ctaBannerDesc">{{ t('productPage.ctaDesc') }}</p>
            <button :class="s.ctaBannerBtn" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
          </div>
        </div>

        <!-- Scenarios -->
        <ProductScenarioTabs v-if="product?.scenarios?.length" :scenarios="product.scenarios" />

        <!-- Testimonial -->
        <div v-if="product?.testimonial" :class="s.testimonial" class="reveal">
          <div :class="s.testimonialContent">
            <div :class="s.quoteIcon" aria-hidden="true">&ldquo;</div>
            <p :class="s.testimonialQuote">"{{ product.testimonial.quote }}"</p>
            <div :class="s.testimonialAuthor">
              <div :class="s.testimonialAvatar">{{ product.testimonial.author.charAt(0) }}</div>
              <div>
                <div :class="s.testimonialName">{{ product.testimonial.author }}</div>
                <div :class="s.testimonialMeta">{{ product.testimonial.title }} &middot; {{ product.testimonial.company }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specs -->
        <div v-if="product?.specs?.length" :class="s.section" class="reveal">
          <SectionHeader :title="t('productPage.specs')" align="left" />
          <div :class="s.specTable">
            <div v-for="(sp, i) in product.specs" :key="i" :class="s.specRow">
              <span :class="s.specLabel">{{ sp.label }}</span>
              <span :class="s.specDots" />
              <span :class="s.specValue">{{ sp.value }}</span>
            </div>
          </div>
        </div>

        <!-- Related -->
        <div v-if="relatedProducts.length" :class="s.section" class="reveal">
          <SectionHeader :title="t('productPage.related')" align="left" />
          <div :class="s.relatedWrap">
            <button :class="[s.relatedArrow, s.relatedArrowLeft]" @click="scrollRelated(-1)">&#8249;</button>
            <div ref="relatedRef" :class="s.relatedGrid">
              <NuxtLink v-for="rp in relatedProducts" :key="rp.slug" :to="`/products/${rp.slug}`" :class="s.relatedCard">
                <div :class="s.relatedIcon" :style="{background:rp.iconBg,color:rp.iconColor}">
                  <component :is="rp.icon" v-if="rp.icon" />
                </div>
                <span :class="s.relatedName">{{ rp.name }}</span>
              </NuxtLink>
            </div>
            <button :class="[s.relatedArrow, s.relatedArrowRight]" @click="scrollRelated(1)">&#8250;</button>
          </div>
        </div>

        <div v-if="!product" :class="s.empty">{{ t('productPage.notFound') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader.vue';
import ProductFeatureCards from '@/components/sections/ProductDetail/ProductFeatureCards.vue';
import ProductScenarioTabs from '@/components/sections/ProductDetail/ProductScenarioTabs.vue';
import { getProductMap } from '@/data/products';
import { cmsApi } from '@/api/cms';
import { useDetailPage } from '@/composables/useDetailPage';
import { useJsonLd } from '@/shared/utils/jsonld';
import s from './[slug].module.css';

function mergeProduct(cms: any, fallback: any) {
  if (!cms && !fallback) return null;
  const base = fallback || {};
  // 注意：fallback.icon 是 Vue 组件函数，无法被 SSR payload 序列化，
  // 因此从 useAsyncData 返回值中排除，改为通过 productIcon computed 读取。
  const { icon: _fallbackIcon, ...serializableBase } = base;
  return {
    ...serializableBase,
    ...cms,
    name: cms?.name ?? base.name,
    tagline: cms?.tagline ?? base.tagline,
    desc: cms?.description ?? base.desc,
    iconBg: base.iconBg || cms?.iconBg,
    iconColor: base.iconColor || cms?.iconColor,
    tabLabel: base.tabLabel || cms?.tabLabel,
    features: cms?.features?.length ? cms.features : base.features,
    scenarios: cms?.scenarios?.length ? cms.scenarios : base.scenarios,
    testimonial: cms?.testimonial || base.testimonial,
    specs: cms?.specs?.length ? cms.specs : base.specs,
    related: cms?.related?.length ? cms.related : base.related,
    awards: cms?.awards?.length ? cms.awards : base.awards,
  };
}

definePageMeta({ title: 'productPage.detail', description: 'productPage.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const modalStore = useModalStore();
const relatedRef = ref<HTMLElement | null>(null);

const slugStr = computed(() => Array.isArray(slug.value) ? slug.value[0] : slug.value);

const productMap = computed(() => getProductMap(locale.value));

// 注意：fallback.icon 是 Vue 组件函数，无法被 SSR payload 序列化，
// 因此 fallbackMap 中剔除 icon（与旧逻辑返回值一致），icon 由 productIcon computed 提供。
const productFallbackMap = computed(() => Object.fromEntries(
  Object.entries(productMap.value as Record<string, any>).map(([key, val]) => {
    const { icon: _icon, ...serializable } = val as Record<string, any>;
    return [key, serializable];
  })
));

const { data: product } = useDetailPage<any>({
  keyFn: () => `product-${slugStr.value}-${locale.value}`,
  // 旧逻辑将 cmsApi 的原始响应直接传给 mergeProduct；此处用包装对象返回，
  // 避免 useDetailPage 内部的 res.data 自动解包改变 mergeProduct 的输入。
  fetchFn: async (key) => ({
    merged: mergeProduct(await cmsApi.getProductBySlug(key), (productMap.value as Record<string, any>)[key] || null),
  }),
  transform: (wrapped) => (wrapped as { merged: any }).merged,
  param: slugStr,
  fallbackMap: productFallbackMap,
  notFoundMessage: 'Product Not Found',
  server: true,
});

useHead(() => {
  if (!product.value) return {};
  const name = product.value.name;
  const desc = product.value.tagline || product.value.desc;
  return {
    title: `${name} | TalentPro`,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: name },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'product' },
    ],
  };
});

const productIcon = computed(() => {
  const key = slugStr.value || '';
  return (productMap.value as Record<string, any>)[key]?.icon;
});

const relatedProducts = computed(() => {
  if (!product.value?.related) return [];
  return product.value.related.map((s: string) => (productMap.value as Record<string, any>)[s]).filter(Boolean);
});

const scrollRelated = (dir: number) => {
  if (!relatedRef.value) return;
  relatedRef.value.scrollBy({ left: dir * 280, behavior: 'smooth' });
};

useJsonLd(computed(() => {
  const val = product.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: val.name,
    description: val.tagline,
    brand: { '@type': 'Brand', name: 'TalentPro' },
    offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
  };
}));
</script>
