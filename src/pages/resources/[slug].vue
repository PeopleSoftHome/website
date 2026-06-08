<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('resourcePage.title'), to: '/resources' },
          { label: resource?.title || t('resourcePage.detail') },
        ]" />

        <div v-if="resource" :class="s.article" class="reveal">
          <div :class="s.header">
            <span :class="s.type" :style="typeStyle(resource.type)">{{ resource.typeLabel }}</span>
            <h1 :class="s.title">{{ resource.title }}</h1>
            <div :class="s.meta">
              <span>{{ formatDate(resource.date) }}</span>
              <span>{{ resource.readTime }} min {{ t('resourcePage.readTime') }}</span>
              <span>{{ resource.downloads }} {{ t('resourcePage.downloads') }}</span>
            </div>
            <div v-if="resource.tags?.length" :class="s.tags">
              <span v-for="tag in resource.tags" :key="tag" :class="s.tag">{{ tag }}</span>
            </div>
          </div>

          <div :class="s.body">
            <p :class="s.desc">{{ resource.description }}</p>
            <div v-if="resource.url" :class="s.actions">
              <a :href="resource.url" target="_blank" :class="s.ctaPrimary">{{ t('resourcePage.download') }}</a>
              <button :class="s.ctaSecondary" @click="modalStore.openModal()">{{ t('resourcePage.demoCta') }}</button>
            </div>
          </div>

          <div :class="s.related" v-if="relatedResources.length" class="reveal">
            <h3 :class="s.relatedTitle">{{ t('resourcePage.related') }}</h3>
            <div :class="s.relatedGrid">
              <NuxtLink
                v-for="r in relatedResources"
                :key="r.id"
                :to="`/resources/${r.slug}`"
                :class="s.relatedCard"
              >
                <span :class="s.relatedType" :style="typeStyle(r.type)">{{ r.typeLabel }}</span>
                <h4 :class="s.relatedName">{{ r.title }}</h4>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-if="!resource" :class="s.empty">{{ t('resourcePage.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, inject, watch } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { RESOURCES, RESOURCE_TYPE_STYLES } from '@/data/resources.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './[slug].vue.module.css';

definePageMeta({ title: 'resourcePage.detail', description: 'resourcePage.subtitle' });

const { t } = useI18n();
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });

const { data: resource } = useAsyncData(
  `resource-${route.params.slug}`,
  async () => {
    const slug = route.params.slug;
    return RESOURCES.find((r) => r.slug === slug) || null;
  },
  { server: false, default: () => null }
);

useHead(() => {
  if (!resource.value) return {};
  return {
    title: `${resource.value.title} | TalentPro`,
    meta: [
      { name: 'description', content: resource.value.description },
      { property: 'og:title', content: resource.value.title },
      { property: 'og:description', content: resource.value.description },
    ],
  };
});

const relatedResources = computed(() => {
  if (!resource.value) return [];
  return RESOURCES.filter((r) => r.type === resource.value.type && r.id !== resource.value.id).slice(0, 3);
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
  watch(resource, (val) => {
    if (val) {
      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'DigitalDocument',
        name: val.title,
        description: val.description,
        publisher: { '@type': 'Organization', name: 'TalentPro' },
      });
    }
  }, { immediate: true });
});
onUnmounted(removeJsonLd);
</script>
