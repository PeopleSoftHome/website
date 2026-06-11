<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('productPage.title'), to: '/products' },
          { label: product?.name || t('productPage.detail') },
        ]" />

        <div v-if="product" :class="s.hero" class="reveal">
          <div :class="s.heroContent">
            <span :class="s.tag">{{ product.tabLabel }}</span>
            <h1 :class="s.title">{{ product.name }}</h1>
            <p :class="s.tagline">{{ product.tagline }}</p>
            <p :class="s.desc">{{ product.desc }}</p>
            <div :class="s.heroActions">
              <button :class="s.ctaPrimary" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
              <NuxtLink v-if="product.url" :to="product.url" :class="s.ctaSecondary">{{ t('productPage.docCta') }}</NuxtLink>
            </div>
          </div>
          <div :class="s.heroVisual" :style="{ background: product.iconBg || 'var(--primary-light)', color: product.iconColor || 'var(--primary)' }">
            <component :is="product.icon" v-if="product.icon" />
            <span v-else>{{ product.name.charAt(0) }}</span>
          </div>
        </div>

        <div v-if="product?.features?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('productPage.features') }}</h2>
          <div :class="s.featureGrid">
            <div v-for="(f, i) in product.features" :key="i" :class="s.featureCard">
              <div :class="s.featureNum">0{{ i + 1 }}</div>
              <h3 :class="s.featureTitle">{{ f.title }}</h3>
              <p :class="s.featureDesc">{{ f.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="product?.scenarios?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('productPage.scenarios') }}</h2>
          <div :class="s.scenarioGrid">
            <div v-for="(sc, i) in product.scenarios" :key="i" :class="s.scenarioCard">
              <h3 :class="s.scenarioTitle">{{ sc.title }}</h3>
              <p :class="s.scenarioDesc">{{ sc.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="product?.testimonial" :class="s.testimonial" class="reveal">
          <div :class="s.testimonialContent">
            <p :class="s.testimonialQuote">"{{ product.testimonial.quote }}"</p>
            <div :class="s.testimonialAuthor">
              <span :class="s.testimonialName">{{ product.testimonial.author }}</span>
              <span :class="s.testimonialMeta">{{ product.testimonial.title }} · {{ product.testimonial.company }}</span>
            </div>
          </div>
        </div>

        <div v-if="product?.specs?.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('productPage.specs') }}</h2>
          <div :class="s.specGrid">
            <div v-for="(sp, i) in product.specs" :key="i" :class="s.specItem">
              <span :class="s.specLabel">{{ sp.label }}</span>
              <span :class="s.specValue">{{ sp.value }}</span>
            </div>
          </div>
        </div>

        <div v-if="relatedProducts.length" :class="s.section" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('productPage.related') }}</h2>
          <div :class="s.relatedGrid">
            <NuxtLink
              v-for="rp in relatedProducts"
              :key="rp.slug"
              :to="`/products/${rp.slug}`"
              :class="s.relatedCard"
            >
              <div :class="s.relatedIcon" :style="{ background: rp.iconBg, color: rp.iconColor }">
                <component :is="rp.icon" v-if="rp.icon" />
              </div>
              <span :class="s.relatedName">{{ rp.name }}</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="!product" :class="s.empty">{{ t('productPage.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, inject, watch } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { PRODUCT_MAP } from '@/data/products.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'productPage.detail', description: 'productPage.subtitle' });

const { t } = useI18n();
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });

const { data: product } = useAsyncData(
  `product-${route.params.slug}`,
  async () => {
    const slug = route.params.slug;
    const data = PRODUCT_MAP[slug] || null;
    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
    }
    return data;
  },
  { server: false, default: () => null }
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
  return product.value.related.map((slug) => PRODUCT_MAP[slug]).filter(Boolean);
});

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
