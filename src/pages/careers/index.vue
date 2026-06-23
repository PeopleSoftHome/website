<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('careers.title'), to: '/careers' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('careers.title') }}</h1>
          <p :class="s.subtitle">{{ t('careers.subtitle') }}</p>
        </div>

        <div :class="s.channels">
          <NuxtLink to="/careers/campus" :class="s.channelCard">
            <div :class="s.channelIcon">🎓</div>
            <h3 :class="s.channelTitle">{{ t('careers.campus') }}</h3>
            <p :class="s.channelDesc">{{ t('careers.campusSubtitle') }}</p>
            <span :class="s.channelCta">{{ t('careers.viewJobs') }} →</span>
          </NuxtLink>
          <NuxtLink to="/careers/social" :class="s.channelCard">
            <div :class="s.channelIcon">💼</div>
            <h3 :class="s.channelTitle">{{ t('careers.social') }}</h3>
            <p :class="s.channelDesc">{{ t('careers.socialSubtitle') }}</p>
            <span :class="s.channelCta">{{ t('careers.viewJobs') }} →</span>
          </NuxtLink>
        </div>

        <div :class="s.filter">
          <button :class="[s.filterBtn, !activeDept ? s.filterActive : '']" @click="activeDept = ''">{{ t('careers.all') }}</button>
          <button v-for="d in departments" :key="d" :class="[s.filterBtn, activeDept === d ? s.filterActive : '']" @click="activeDept = d">{{ d }}</button>
        </div>

        <div v-if="loading" :class="s.loading">{{ t('common.loading') }}</div>
        <div v-else-if="error && jobs.length === 0" :class="s.error">{{ error }}</div>

        <div v-else :class="s.list">
          <NuxtLink v-for="job in displayJobs" :key="job.id" :to="`/careers/${job.id}`" :class="s.job" :style="{ '--stagger': job._stagger }">
            <div :class="s.jobHeader">
              <h3 :class="s.jobTitle">{{ job.title }}</h3>
              <span :class="s.jobType">{{ job.type }}</span>
            </div>
            <div :class="s.jobMeta">
              <span>{{ job.department }}</span>
              <span>{{ job.location }}</span>
              <span v-if="job.salaryMin != null">{{ job.salaryMin }}k-{{ job.salaryMax ?? '-' }}k</span>
            </div>
            <p v-if="job.summary" :class="s.jobSummary">{{ job.summary }}</p>
          </NuxtLink>
          <div v-if="displayJobs.length < filteredJobs.length" :class="s.moreWrap">
            <button :class="s.moreBtn" @click="displayLimit += PAGE_SIZE">{{ t('common.loadMore') }}</button>
          </div>
        </div>

        <div :class="s.path" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('careers.pathTitle') }}</h2>
          <div :class="s.pathList">
            <div v-for="(p, i) in careerPath" :key="i" :class="s.pathItem">
              <div :class="s.pathIcon">{{ p.icon }}</div>
              <h4 :class="s.pathStage">{{ p.stage }}</h4>
              <p :class="s.pathDesc">{{ p.desc }}</p>
              <div v-if="i < careerPath.length - 1" :class="s.pathLine" />
            </div>
          </div>
        </div>

        <div :class="s.testimonials" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('careers.testimonialTitle') }}</h2>
          <div :class="s.testiList">
            <div v-for="(item, i) in testimonials" :key="i" :class="s.testiCard" :style="{ '--stagger': i }">
              <div :class="s.testiQuote">{{ item.quote }}</div>
              <div :class="s.testiAuthor">
                <div :class="s.testiAvatar">{{ item.avatar }}</div>
                <div>
                  <div :class="s.testiName">{{ item.name }}</div>
                  <div :class="s.testiRole">{{ item.role }} · {{ item.joinYear }} 年加入</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div :class="s.benefits" class="reveal">
          <h2 :class="s.benefitsTitle">{{ t('careers.benefits') }}</h2>
          <p :class="s.benefitsDesc">{{ t('careers.benefitsDesc') }}</p>
          <div :class="s.benefitGrid">
            <div v-for="(b, i) in benefits" :key="i" :class="s.benefitCard">
              <div :class="s.benefitIcon">{{ b.icon }}</div>
              <h4 :class="s.benefitName">{{ t(b.nameKey) }}</h4>
              <p :class="s.benefitDesc">{{ t(b.descKey) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'careers.title', description: 'careers.subtitle' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { careersApi } from '@/api/careers';
import { CAREER_TESTIMONIALS, CAREER_PATH } from '@/data/careers';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld';
import s from './index.module.css';

const { t } = useI18n();

const activeDept = ref('');
const PAGE_SIZE = 6;
const displayLimit = ref(PAGE_SIZE);

interface Job {
  id: string;
  title: string;
  type: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  summary?: string;
}

const { data: jobsRes, pending: loading, error: fetchError } = useAsyncData(
  'careers-jobs',
  () => careersApi.getJobs({ department: activeDept.value || undefined }),
  { server: false, watch: [activeDept], default: () => ({ data: [] as Job[] }) }
);

const filteredJobs = computed(() => {
  const list = (jobsRes.value as { data?: Job[] } | undefined)?.data || [];
  if (!activeDept.value) return list;
  return list.filter((j) => j.department === activeDept.value);
});

const displayJobs = computed(() => {
  const list = filteredJobs.value.slice(0, displayLimit.value);
  return list.map((j, idx) => ({ ...j, _stagger: idx }));
});

const departments = computed<string[]>(() => {
  const depts = new Set((jobsRes.value as { data?: Job[] } | undefined)?.data?.map((j) => j.department).filter(Boolean));
  return Array.from(depts) as string[];
});
const jobs = computed(() => {
  if (fetchError.value) return [];
  return (jobsRes.value as { data?: Job[] } | undefined)?.data || [];
});
const error = computed(() => {
  if (!fetchError.value) return null;
  const err = fetchError.value as any;
  return err.response?.data?.message || err.message || t('common.loadError');
});

const benefits = [
  { icon: '💰', nameKey: 'careers.benefits.salary', descKey: 'careers.benefits.salaryDesc' },
  { icon: '📈', nameKey: 'careers.benefits.growth', descKey: 'careers.benefits.growthDesc' },
  { icon: '🏥', nameKey: 'careers.benefits.health', descKey: 'careers.benefits.healthDesc' },
  { icon: '🏠', nameKey: 'careers.benefits.flexible', descKey: 'careers.benefits.flexibleDesc' },
  { icon: '🍱', nameKey: 'careers.benefits.lifestyle', descKey: 'careers.benefits.lifestyleDesc' },
  { icon: '🌍', nameKey: 'careers.benefits.team', descKey: 'careers.benefits.teamDesc' },
];

const careerPath = CAREER_PATH;
const testimonials = CAREER_TESTIMONIALS;

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('careers.jsonLdName'),
    description: t('careers.jsonLdDesc'),
    url: 'https://talentpro.cn/careers',
    publisher: { '@type': 'Organization', name: 'TalentPro', logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' } },
  });
});
onUnmounted(removeJsonLd);
</script>
