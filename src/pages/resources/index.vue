<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('resourcePage.title'), to: '/resources' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('resourcePage.title') }}</h1>
          <p :class="s.subtitle">{{ t('resourcePage.subtitle') }}</p>
        </div>

        <div :class="s.controls" class="reveal reveal-delay-1">
          <TabNav
            :tabs="tabItems"
            :active-index="activeTabIndex"
            variant="segment"
            @select="activeTabIndex = $event"
          />
          <input
            v-model="searchQuery"
            :class="s.searchInput"
            type="text"
            :placeholder="t('resourcePage.searchPlaceholder')"
          />
        </div>

        <div v-if="featuredResources.length && !searchQuery && activeTabIndex === 0" :class="s.featured" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('resourcePage.featured') }}</h2>
          <div :class="s.featuredGrid">
            <NuxtLink
              v-for="r in featuredResources"
              :key="r.id"
              :to="`/resources/${r.slug}`"
              :class="s.featuredCard"
              :style="{ background: r.imgGrad }"
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

        <div :class="s.grid">
          <NuxtLink
            v-for="(r, idx) in filteredResources"
            :key="r.id"
            :to="`/resources/${r.slug}`"
            :class="s.card"
            :style="{ '--stagger': idx }"
          >
            <div :class="s.cardCover" :style="{ background: r.imgGrad }">
              <span :class="s.cardIcon">{{ r.typeLabel?.charAt(0) }}</span>
            </div>
            <div :class="s.cardBody">
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
            </div>
          </NuxtLink>
        </div>

        <div v-if="!filteredResources.length" :class="s.empty">
          {{ t('resourcePage.noResults') }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'resourcePage.title', description: 'resourcePage.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import { RESOURCES, RESOURCE_TYPES, RESOURCE_TYPE_STYLES } from '@/data/resources.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './index.vue.module.css';

const { t } = useI18n();
const activeTabIndex = ref(0);
const searchQuery = ref('');

const tabItems = computed(() => [
  { id: 'all', label: t('resourcePage.all') },
  ...RESOURCE_TYPES.map((type) => ({ id: type.value, label: type.label })),
]);

const activeType = computed(() => tabItems.value[activeTabIndex.value]?.id || '');

const featuredResources = computed(() => RESOURCES.filter((r) => r.featured));

const filteredResources = computed(() => {
  let list = RESOURCES;
  if (activeType.value && activeType.value !== 'all') {
    list = list.filter((r) => r.type === activeType.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  if (activeTabIndex.value === 0 && !q) {
    list = list.filter((r) => !r.featured);
  }
  return list;
});

const formatDate = (d: string | number | Date | undefined) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString();
};

const typeStyle = (type: string) => {
  const styles = RESOURCE_TYPE_STYLES as Record<string, { bg: string; color: string }>;
  const style = (styles[type] || styles['article']) as { bg: string; color: string };
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
