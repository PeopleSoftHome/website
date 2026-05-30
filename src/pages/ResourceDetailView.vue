<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('resourcePage.title'), to: '/resources' },
          { label: resource?.title || t('resourcePage.detail') },
        ]" />

        <div v-if="resource" :class="s.article">
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

          <div :class="s.related" v-if="relatedResources.length">
            <h3 :class="s.relatedTitle">{{ t('resourcePage.related') }}</h3>
            <div :class="s.relatedGrid">
              <router-link
                v-for="r in relatedResources"
                :key="r.id"
                :to="`/resources/${r.slug}`"
                :class="s.relatedCard"
              >
                <span :class="s.relatedType" :style="typeStyle(r.type)">{{ r.typeLabel }}</span>
                <h4 :class="s.relatedName">{{ r.title }}</h4>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="!resource" :class="s.empty">{{ t('resourcePage.notFound') }}</div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { RESOURCES, RESOURCE_TYPE_STYLES } from '@/data/resources.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './ResourceDetailView.module.css';

const { t } = inject('i18n', { t: (k) => k });
const route = useRoute();
const modalStore = inject('modal', { openModal: () => {} });
const resource = ref(null);

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
    injectJsonLd({ '@context': 'https://schema.org', '@type': 'DigitalDocument', name: resource.value?.title || 'TalentPro 资源' });
  const slug = route.params.slug;
  resource.value = RESOURCES.find((r) => r.slug === slug);
  if (resource.value) {
    document.title = `${resource.value.title} | ${t('resourcePage.title')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${resource.value.title} | ${t('resourcePage.title')}`);
  }
});
onUnmounted(removeJsonLd);
</script>
