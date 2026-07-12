<template>
  <div>
    <!-- 阅读进度条 -->
    <div :class="s.progressBar" :style="progressStyle" />

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[
          { label: t('resourcePage.title'), to: '/resources' },
          { label: resource?.title || t('resourcePage.detail') },
        ]" />

        <div v-if="resource" :class="s.layout">
          <!-- Sticky TOC -->
          <aside v-if="resource.chapters?.length" :class="s.toc">
            <nav :class="s.tocNav">
              <div :class="s.tocTitle">{{ t('resourcePage.contents') }}</div>
              <a
                v-for="ch in resource.chapters"
                :key="ch.id"
                :href="`#section-${ch.id}`"
                :class="[s.tocLink, activeId === ch.id ? s.tocActive : '']"
                @click.prevent="scrollToSection(ch.id)"
              >
                {{ ch.title }}
              </a>
            </nav>
          </aside>

          <article :class="s.article" class="reveal">
            <div :class="s.header">
              <span :class="s.type" :style="typeStyle(resource.type)">{{ resource.typeLabel }}</span>
              <h1 :class="s.title">{{ resource.title }}</h1>
              <div :class="s.meta">
                <span>{{ formatDate(resource.date) }}</span>
                <span>{{ resource.readTime }} min {{ t('resourcePage.readTime') }}</span>
                <span>{{ resource.downloads }} {{ t('resourcePage.downloads') }}</span>
                <span v-if="resource.audience" :class="s.audience">{{ resource.audience }}</span>
              </div>
              <div v-if="resource.tags?.length" :class="s.tags">
                <span v-for="tag in resource.tags" :key="tag" :class="s.tag">{{ tag }}</span>
              </div>

              <!-- 分享按钮 -->
              <div :class="s.share">
                <span :class="s.shareLabel">{{ t('resourcePage.share') }}</span>
                <a :href="weiboShareUrl" target="_blank" :class="s.shareBtn" :title="t('resourcePage.weibo')">{{ t('resourcePage.weibo') }}</a>
                <a :href="linkedinShareUrl" target="_blank" :class="s.shareBtn" title="LinkedIn">LinkedIn</a>
                <span :class="s.shareTip" @click="showWxTip = !showWxTip">{{ t('resourcePage.wechat') }}</span>
                <span v-if="showWxTip" :class="s.wxTip">{{ t('resourcePage.wechatTip') }}</span>
              </div>
            </div>

            <!-- 关键要点 -->
            <div v-if="resource.keyTakeaways?.length" :class="s.takeaways">
              <h3 :class="s.takeawaysTitle">{{ t('resourcePage.keyTakeaways') }}</h3>
              <ul :class="s.takeawaysList">
                <li v-for="(item, i) in resource.keyTakeaways" :key="i">{{ item }}</li>
              </ul>
            </div>

            <!-- 章节内容 -->
            <div v-if="resource.chapters?.length" :class="s.chapters">
              <section
                v-for="ch in resource.chapters"
                :id="`section-${ch.id}`"
                :key="ch.id"
                :data-section="ch.id"
                :class="s.chapter"
              >
                <h2 :class="s.chapterTitle">{{ ch.title }}</h2>
                <p :class="s.chapterBody">{{ ch.content }}</p>
              </section>
            </div>
            <div v-else :class="s.body">
              <p :class="s.desc">{{ resource.description }}</p>
            </div>

            <!-- 下载 / CTA -->
            <div :class="s.actions">
              <button v-if="resource.url" :class="s.ctaPrimary" @click="handleDownload">
                {{ t('resourcePage.download') }}
              </button>
              <button :class="s.ctaSecondary" @click="modalStore.openModal()">
                {{ t('resourcePage.demoCta') }}
              </button>
            </div>

            <!-- 反馈 -->
            <div :class="s.feedback">
              <span :class="s.feedbackLabel">{{ t('resourcePage.feedback') }}</span>
              <button :class="s.feedbackBtn" @click="handleFeedback('up')">👍</button>
              <button :class="s.feedbackBtn" @click="handleFeedback('down')">👎</button>
              <span v-if="feedbackMsg" :class="s.feedbackMsg">{{ feedbackMsg }}</span>
            </div>

            <!-- 相关资源 -->
            <div v-if="relatedResources.length" :class="s.related" class="reveal">
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
          </article>
        </div>

        <div v-if="!resource" :class="s.empty">{{ t('resourcePage.notFound') }}</div>
      </div>
    </main>

    <!-- 下载表单弹窗 -->
    <div v-if="showForm" :class="s.formOverlay" @click.self="showForm = false">
      <div :class="s.formModal">
        <h3 :class="s.formTitle">{{ t('resourcePage.downloadForm') }}</h3>
        <input v-model="form.name" :class="s.formInput" type="text" :placeholder="t('resourcePage.formName')" />
        <input v-model="form.email" :class="s.formInput" type="email" :placeholder="t('resourcePage.formEmail')" />
        <input v-model="form.company" :class="s.formInput" type="text" :placeholder="t('resourcePage.formCompany')" />
        <div v-if="formError" :class="s.formError">{{ formError }}</div>
        <div :class="s.formActions">
          <button :class="s.ctaPrimary" @click="submitForm">{{ t('resourcePage.submit') }}</button>
          <button :class="s.ctaSecondary" @click="showForm = false">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { getResources, RESOURCE_TYPE_STYLES } from '@/data/resources';
import { useJsonLd } from '@/utils/jsonld';
import { useScrollProgress } from '@/composables/useScrollProgress';
import { useSpyScroll } from '@/composables/useSpyScroll';
import s from './[slug].module.css';

definePageMeta({ title: 'resourcePage.detail', description: 'resourcePage.subtitle' });

const { t, locale } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug);
const modalStore = useModalStore();
const resources = computed(() => getResources(locale.value));
const { progressStyle } = useScrollProgress();
const { activeId } = useSpyScroll('[data-section]');

const showForm = ref(false);
const showWxTip = ref(false);
const feedbackMsg = ref('');
const form = ref({ name: '', email: '', company: '' });
const formError = ref('');

const { data: resource } = useAsyncData(
  () => `resource-${slug.value}`,
  async () => {
    const data = resources.value.find((r) => r.slug === slug.value) || null;
    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Resource Not Found', fatal: true });
    }
    return data;
  },
  { default: () => null, watch: [slug, locale] }
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
  const current = resource.value;
  if (!current) return [];
  return resources.value.filter((r) => r.type === current.type && r.id !== current.id).slice(0, 3);
});

const pageUrl = computed(() => {
  if (process.client) return window.location.href;
  return `https://talentpro.cn/resources/${route.params.slug}`;
});

const weiboShareUrl = computed(() => {
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(pageUrl.value)}&title=${encodeURIComponent(resource.value?.title || '')}`;
  return url;
});

const linkedinShareUrl = computed(() => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl.value)}`;
});

const typeStyle = (type: string) => {
  const styles = RESOURCE_TYPE_STYLES as Record<string, { bg: string; color: string }>;
  const style = (styles[type] || styles['article']) as { bg: string; color: string };
  return { background: style.bg, color: style.color };
};

const scrollToSection = (id: string) => {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(`section-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const handleDownload = () => {
  if (resource.value?.formRequired) {
    showForm.value = true;
  } else if (resource.value?.url) {
    if (typeof window !== 'undefined') window.open(resource.value.url, '_blank');
  }
};

const submitForm = () => {
  formError.value = '';
  if (!form.value.name.trim()) { formError.value = t('resourcePage.formNameRequired'); return; }
  if (!form.value.email.trim() || !/\S+@\S+\.\S+/.test(form.value.email)) { formError.value = t('resourcePage.formEmailRequired'); return; }
  if (!form.value.company.trim()) { formError.value = t('resourcePage.formCompanyRequired'); return; }
  showForm.value = false;
  if (resource.value?.url && typeof window !== 'undefined') window.open(resource.value.url, '_blank');
};

const handleFeedback = (type: string) => {
  feedbackMsg.value = type === 'up' ? t('resourcePage.feedbackUp') : t('resourcePage.feedbackDown');
  setTimeout(() => { feedbackMsg.value = ''; }, 3000);
};

useJsonLd(computed(() => {
  const val = resource.value;
  if (!val) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: val.title,
    description: val.description,
    publisher: { '@type': 'Organization', name: 'TalentPro' },
  };
}));
</script>
