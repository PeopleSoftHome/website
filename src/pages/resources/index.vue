<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('resourcePage.title'), to: '/resources' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('resourcePage.title') }}</h1>
          <p :class="s.subtitle">{{ t('resourcePage.subtitle') }}</p>
        </div>

        <div :class="s.filter" class="reveal reveal-delay-1">
          <button
            v-for="type in types"
            :key="type.value"
            :class="[s.filterBtn, activeType === type.value ? s.filterActive : '']"
            @click="activeType = type.value"
          >
            {{ type.label }}
          </button>
        </div>

        <div v-if="featuredResources.length && !activeType" :class="s.featured" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('resourcePage.featured') }}</h2>
          <div :class="s.featuredGrid">
            <NuxtLink
              v-for="r in featuredResources"
              :key="r.id"
              :to="`/resources/${r.slug}`"
              :class="s.featuredCard"
            >
              <div :class="s.featuredHeader">
                <span :class="s.featuredType" :style="typeStyle(r.type)">{{ r.typeLabel }}</span>
                <span :class="s.featuredDate">{{ formatDate(r.date) }}</span>
              </div>
              <h3 :class="s.featuredTitle">{{ r.title }}</h3>
              <p :class="s.featuredDesc">{{ r.description }}</p>
              <div :class="s.featuredMeta">
                <span>{{ r.readTime }} min</span>
                <span>{{ r.downloads }} {{ t('resourcePage.downloads') }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div :class="s.grid" class="reveal">
          <NuxtLink
            v-for="r in filteredResources"
            :key="r.id"
            :to="`/resources/${r.slug}`"
            :class="s.card"
          >
            <div :class="s.cardHeader">
              <span :class="s.cardType" :style="typeStyle(r.type)">{{ r.typeLabel }}</span>
              <span :class="s.cardDate">{{ formatDate(r.date) }}</span>
            </div>
            <h3 :class="s.cardTitle">{{ r.title }}</h3>
            <p :class="s.cardDesc">{{ r.description }}</p>
            <div :class="s.cardFooter">
              <div :class="s.cardMeta">
                <span>{{ r.readTime }} min</span>
                <span>{{ r.downloads }} {{ t('resourcePage.downloads') }}</span>
              </div>
              <span :class="s.cardCta">{{ r.cta }} →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'resourcePage.title', description: 'resourcePage.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { RESOURCES, RESOURCE_TYPES, RESOURCE_TYPE_STYLES } from '@/data/resources.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './index.vue.module.css';

const { t } = useI18n();
const activeType = ref('');
const types = [{ value: '', label: t('resourcePage.all') || '全部' }, ...RESOURCE_TYPES];

const featuredResources = computed(() => RESOURCES.filter((r) => r.featured));

const filteredResources = computed(() => {
  if (!activeType.value) return RESOURCES.filter((r) => !r.featured);
  return RESOURCES.filter((r) => r.type === activeType.value);
});

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

const typeStyle = (type) => {
  const style = RESOURCE_TYPE_STYLES[type] || RESOURCE_TYPE_STYLES['article'];
  return { background: style.bg, color: style.color };
};

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'TalentPro 资源中心',
    description: '白皮书、报告、指南与工具',
    url: 'https://talentpro.cn/resources',
    hasPart: RESOURCES.slice(0, 6).map((r) => ({
      '@type': 'CreativeWork',
      name: r.title,
      description: r.description,
    })),
  });
});
onUnmounted(removeJsonLd);
</script>
