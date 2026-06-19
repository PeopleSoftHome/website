<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('about.title'), to: '/about' },
          { label: t('team.title') },
        ]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('team.title') }}</h1>
          <p :class="s.subtitle">{{ t('team.subtitle') }}</p>
        </div>

        <div :class="s.filter" class="reveal">
          <TabNav :tabs="categoryTabs" :active-index="activeCategoryIndex" variant="pill" @select="activeCategoryIndex = $event" />
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && displayTeam.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.grid">
          <div v-for="(member, idx) in displayTeam" :key="member.id" :class="s.member" :style="{ '--stagger': idx }">
            <div :class="s.avatar" :style="member.avatar ? `background-image:url(${member.avatar})` : ''">
              <span v-if="!member.avatar">{{ member.name?.charAt(0) || '' }}</span>
            </div>
            <h3 :class="s.name">{{ member.name }}</h3>
            <p :class="s.role">{{ member.role }}</p>
            <span :class="s.categoryTag">{{ member.category }}</span>
            <p v-if="member.bio" :class="s.bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'team.title', description: 'team.subtitle' });
import { onMounted, onUnmounted, computed, ref } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import TabNav from '@/components/ui/TabNav/TabNav.vue';
import { aboutApi } from '@/api/about.js';
import { TEAM_CATEGORIES, TEAM_FALLBACK } from '@/data/team.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './team.vue.module.css';

const { t } = useI18n();
const activeCategoryIndex = ref(0);

const categoryTabs = computed(() => TEAM_CATEGORIES.map((c) => ({ id: c, label: c })));
const activeCategory = computed(() => categoryTabs.value[activeCategoryIndex.value]?.id || TEAM_CATEGORIES[0]);

const { data: apiTeam, pending: loading, error: asyncError } = useAsyncData(
  'about-team',
  async () => {
    const res = await aboutApi.getTeam({});
    return res.data || [];
  },
  { server: false, default: () => [] as any[] }
);

const team = computed(() => {
  if (asyncError.value) return TEAM_FALLBACK;
  const data = apiTeam.value || [];
  return data.length > 0 ? data : TEAM_FALLBACK;
});

const displayTeam = computed(() => {
  if (activeCategory.value === '全部') return team.value;
  return team.value.filter((m: any) => m.category === activeCategory.value);
});

const error = computed(() => {
  if (!asyncError.value) return null;
  const err = asyncError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('team.jsonLdName'),
    description: t('team.jsonLdDesc'),
    url: 'https://talentpro.cn/about/team',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
