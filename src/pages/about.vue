<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('about.title'), to: '/about' }]" />

        <div :class="s.hero">
          <h1 :class="s.title">{{ t('about.title') }}</h1>
          <p :class="s.subtitle">{{ t('about.subtitle') }}</p>
        </div>

        <div :class="s.story">
          <h2 :class="s.sectionTitle">{{ t('about.story') }}</h2>
          <p :class="s.storyBody">{{ t('about.storyBody') }}</p>
        </div>

        <div :class="s.stats">
          <div v-for="(st, i) in stats" :key="i" :class="s.stat">
            <span :class="s.statValue">{{ st.value }}</span>
            <span :class="s.statLabel">{{ st.label }}</span>
          </div>
        </div>

        <div :class="s.values">
          <h2 :class="s.sectionTitle">{{ t('about.values') }}</h2>
          <div :class="s.valueGrid">
            <div v-for="(v, i) in values" :key="i" :class="s.valueCard">
              <div :class="s.valueIcon">{{ v.icon }}</div>
              <h3 :class="s.valueTitle">{{ v.title }}</h3>
              <p :class="s.valueDesc">{{ v.desc }}</p>
            </div>
          </div>
        </div>

        <div :class="s.links">
          <NuxtLink to="/about/team" :class="s.linkCard">
            <div :class="s.linkIcon">👥</div>
            <h3 :class="s.linkTitle">{{ t('team.title') }}</h3>
            <p :class="s.linkDesc">{{ t('team.subtitle') }}</p>
            <span :class="s.linkCta">{{ t('about.learnMore') }} →</span>
          </NuxtLink>
          <NuxtLink to="/about/partners" :class="s.linkCard">
            <div :class="s.linkIcon">🤝</div>
            <h3 :class="s.linkTitle">{{ t('partners.title') }}</h3>
            <p :class="s.linkDesc">{{ t('partners.subtitle') }}</p>
            <span :class="s.linkCta">{{ t('about.learnMore') }} →</span>
          </NuxtLink>
          <NuxtLink to="/about/contact" :class="s.linkCard">
            <div :class="s.linkIcon">📧</div>
            <h3 :class="s.linkTitle">{{ t('contactPage.title') }}</h3>
            <p :class="s.linkDesc">{{ t('contactPage.subtitle') }}</p>
            <span :class="s.linkCta">{{ t('about.learnMore') }} →</span>
          </NuxtLink>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'about.title', description: 'about.subtitle' });
import { inject, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './about.vue.module.css';

const { t } = useI18n();

const values = [
  { icon: '🎯', title: t('about.val1Title'), desc: t('about.val1Desc') },
  { icon: '💡', title: t('about.val2Title'), desc: t('about.val2Desc') },
  { icon: '🤝', title: t('about.val3Title'), desc: t('about.val3Desc') },
  { icon: '🚀', title: t('about.val4Title'), desc: t('about.val4Desc') },
];

const stats = [
  { value: '2018', label: t('about.founded') },
  { value: '500+', label: t('about.employees') },
  { value: '6,000+', label: t('about.customers') },
  { value: '12', label: t('about.countries') },
];

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t('about.jsonLdName'),
    description: t('about.jsonLdDesc'),
    url: 'https://talentpro.cn/about',
    logo: 'https://talentpro.cn/logo.png',
    foundingDate: '2018',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: '500+' },
    areaServed: { '@type': 'Country', name: 'CN' },
    sameAs: [
      'https://www.linkedin.com/company/talentpro',
      'https://twitter.com/talentpro',
    ],
  });
});
onUnmounted(removeJsonLd);
</script>
