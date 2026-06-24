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
            <component :is="product.icon" v-if="product.icon" />
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader.vue';
import ProductFeatureCards from '@/components/sections/ProductDetail/ProductFeatureCards.vue';
import ProductScenarioTabs from '@/components/sections/ProductDetail/ProductScenarioTabs.vue';
import { PRODUCT_MAP } from '@/data/products';
import { cmsApi } from '@/api/cms';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import s from './[slug].module.css';

function mergeProduct(cms: any, fallback: any) {
  if (!cms && !fallback) return null;
  const base = fallback || {};
  return {
    ...base,
    ...cms,
    name: cms?.name ?? base.name,
    tagline: cms?.tagline ?? base.tagline,
    desc: cms?.description ?? base.desc,
    icon: base.icon || cms?.icon,
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

const { t } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const modalStore = useModalStore();
const relatedRef = ref<HTMLElement | null>(null);

const slugStr = computed(() => Array.isArray(slug.value) ? slug.value[0] : slug.value);

const { data: product } = useAsyncData(
  () => `product-${slugStr.value}`,
  async () => {
    const key = slugStr.value || '';
    const fallback = (PRODUCT_MAP as Record<string, any>)[key] || null;
    try {
      const cms = await cmsApi.getProductBySlug(key);
      const merged = mergeProduct(cms, fallback);
      if (merged) return merged;
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn(`[ProductDetail] CMS load failed for ${key}, using fallback`, (e as Error).message);
      }
    }
    if (!fallback) {
      throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
    }
    return fallback;
  },
  { server: false, default: () => null, watch: [slugStr] }
);

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

const relatedProducts = computed(() => {
  if (!product.value?.related) return [];
  return product.value.related.map((s: string) => (PRODUCT_MAP as Record<string, any>)[s]).filter(Boolean);
});

const scrollRelated = (dir: number) => {
  if (!relatedRef.value) return;
  relatedRef.value.scrollBy({ left: dir * 280, behavior: 'smooth' });
};

onMounted(() => {
  watch(product, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: val.name,
        description: val.tagline,
        brand: { '@type': 'Brand', name: 'TalentPro' },
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
      });
    }
  }, { immediate: true });
});
onUnmounted(removeJsonLd);
</script>
