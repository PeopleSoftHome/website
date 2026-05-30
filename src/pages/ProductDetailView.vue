<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('productPage.title'), to: '/products' },
          { label: product?.name || t('productPage.detail') },
        ]" />

        <div v-if="product" :class="s.hero">
          <div :class="s.heroContent">
            <span :class="s.tag">{{ product.tabLabel }}</span>
            <h1 :class="s.title">{{ product.name }}</h1>
            <p :class="s.tagline">{{ product.tagline }}</p>
            <p :class="s.desc">{{ product.desc }}</p>
            <div :class="s.heroActions">
              <button :class="s.ctaPrimary" @click="modalStore.openModal()">{{ t('productPage.demoCta') }}</button>
              <router-link v-if="product.url" :to="product.url" :class="s.ctaSecondary">{{ t('productPage.docCta') }}</router-link>
            </div>
          </div>
          <div :class="s.heroVisual" :style="{ background: product.iconBg || 'var(--primary-light)', color: product.iconColor || 'var(--primary)' }">
            <component :is="product.icon" v-if="product.icon" />
            <span v-else>{{ product.name.charAt(0) }}</span>
          </div>
        </div>

        <div v-if="product?.features?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('productPage.features') }}</h2>
          <div :class="s.featureGrid">
            <div v-for="(f, i) in product.features" :key="i" :class="s.featureCard">
              <div :class="s.featureNum">0{{ i + 1 }}</div>
              <h3 :class="s.featureTitle">{{ f.title }}</h3>
              <p :class="s.featureDesc">{{ f.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="product?.scenarios?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('productPage.scenarios') }}</h2>
          <div :class="s.scenarioGrid">
            <div v-for="(sc, i) in product.scenarios" :key="i" :class="s.scenarioCard">
              <h3 :class="s.scenarioTitle">{{ sc.title }}</h3>
              <p :class="s.scenarioDesc">{{ sc.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="product?.testimonial" :class="s.testimonial">
          <div :class="s.testimonialContent">
            <p :class="s.testimonialQuote">"{{ product.testimonial.quote }}"</p>
            <div :class="s.testimonialAuthor">
              <span :class="s.testimonialName">{{ product.testimonial.author }}</span>
              <span :class="s.testimonialMeta">{{ product.testimonial.title }} · {{ product.testimonial.company }}</span>
            </div>
          </div>
        </div>

        <div v-if="product?.specs?.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('productPage.specs') }}</h2>
          <div :class="s.specGrid">
            <div v-for="(sp, i) in product.specs" :key="i" :class="s.specItem">
              <span :class="s.specLabel">{{ sp.label }}</span>
              <span :class="s.specValue">{{ sp.value }}</span>
            </div>
          </div>
        </div>

        <div v-if="relatedProducts.length" :class="s.section">
          <h2 :class="s.sectionTitle">{{ t('productPage.related') }}</h2>
          <div :class="s.relatedGrid">
            <router-link
              v-for="rp in relatedProducts"
              :key="rp.slug"
              :to="`/products/${rp.slug}`"
              :class="s.relatedCard"
            >
              <div :class="s.relatedIcon" :style="{ background: rp.iconBg, color: rp.iconColor }">
                <component :is="rp.icon" v-if="rp.icon" />
              </div>
              <span :class="s.relatedName">{{ rp.name }}</span>
            </router-link>
          </div>
        </div>

        <div v-if="!product" :class="s.empty">{{ t('productPage.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { PRODUCT_MAP } from '@/data/products.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './ProductDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });

const product = ref(null);

const relatedProducts = computed(() => {
  if (!product.value?.related) return [];
  return product.value.related.map((slug) => PRODUCT_MAP[slug]).filter(Boolean);
});

onMounted(() => {
    injectJsonLd({ '@context': 'https://schema.org', '@type': 'Product', name: product.value?.name || 'TalentPro 产品' });
  const slug = route.params.slug;
  product.value = PRODUCT_MAP[slug] || null;
  if (product.value) {
    document.title = `${product.value.name} | ${t('productPage.title')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${product.value.name} | ${t('productPage.title')}`);
  }
});
onUnmounted(removeJsonLd);
</script>
