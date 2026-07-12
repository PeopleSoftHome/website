<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('about.title'), to: '/about' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('about.title') }}</h1>
          <p :class="s.subtitle">{{ t('about.subtitle') }}</p>
        </div>

        <div :class="s.story">
          <h2 :class="s.sectionTitle">{{ t('about.story') }}</h2>
          <p :class="s.storyBody">{{ t('about.storyBody') }}</p>
        </div>

        <!-- Timeline -->
        <div :class="s.timeline" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('about.timeline') }}</h2>
          <div :class="s.timelineWrap">
            <div v-for="(item, i) in timeline" :key="i" :class="s.timelineItem">
              <div :class="s.timelineLeft">
                <div :class="s.timelineYear">{{ item.year }}</div>
                <div v-if="i < timeline.length - 1" :class="s.timelineLine" />
              </div>
              <div :class="s.timelineCard">
                <h3 :class="s.timelineTitle">{{ item.title }}</h3>
                <p :class="s.timelineDesc">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <div :class="s.stats" class="reveal">
          <div v-for="(st, i) in stats" :key="i" :class="s.stat">
            <span :class="s.statValue">{{ st.value }}</span>
            <span :class="s.statLabel">{{ st.label }}</span>
          </div>
        </div>

        <div :class="s.values" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('about.values') }}</h2>
          <div :class="s.valueGrid">
            <div v-for="(v, i) in values" :key="i" :class="s.valueCard">
              <div :class="s.valueIcon">{{ v.icon }}</div>
              <h3 :class="s.valueTitle">{{ v.title }}</h3>
              <p :class="s.valueDesc">{{ v.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div :class="s.certs" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('about.certifications') }}</h2>
          <div :class="s.certGrid">
            <div v-for="c in certifications" :key="c.name" :class="s.certCard">
              <div :class="s.certIcon">{{ c.icon }}</div>
              <span :class="s.certName">{{ c.name }}</span>
            </div>
          </div>
        </div>

        <!-- Partners -->
        <div :class="s.partners" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('about.partners') }}</h2>
          <div :class="s.partnerGrid">
            <div v-for="p in partnerLogos" :key="p" :class="s.partnerLogo">{{ p }}</div>
          </div>
        </div>

        <!-- Office Gallery -->
        <div :class="s.gallery" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('about.office') }}</h2>
          <div :class="s.galleryGrid">
            <div v-for="i in 4" :key="i" :class="s.galleryItem">
              <svg viewBox="0 0 200 140" :class="s.gallerySvg">
                <rect width="100%" height="100%" fill="var(--gray-100)" rx="8" />
                <rect x="20" y="30" width="60" height="8" rx="4" fill="var(--gray-200)" />
                <rect x="20" y="50" width="40" height="6" rx="3" fill="var(--gray-200)" />
                <circle cx="150" cy="70" r="30" fill="var(--primary-alpha-8)" />
                <rect x="20" y="90" width="100" height="6" rx="3" fill="var(--gray-200)" />
              </svg>
            </div>
          </div>
        </div>

        <div :class="s.links" class="reveal">
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

<script setup lang="ts">
definePageMeta({ title: 'about.title', description: 'about.subtitle' });
import { computed } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { getTimeline } from '@/data/timeline';
import { getCertifications, getPartnerLogos } from '@/data/contact';
import { useJsonLd } from '@/utils/jsonld';
import s from './index.module.css';

const { t, locale } = useI18n();

const timeline = computed(() => getTimeline(locale.value));
const certifications = computed(() => getCertifications(locale.value));
const partnerLogos = computed(() => getPartnerLogos(locale.value));

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

useJsonLd({
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
</script>
