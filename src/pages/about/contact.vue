<template>
  <div>

    <main :class="s.page">
      <div class="container">
        <Breadcrumb :items="[{ label: t('contactPage.title'), to: '/about/contact' }]" />

        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('contactPage.title') }}</h1>
          <p :class="s.subtitle">{{ t('contactPage.subtitle') }}</p>
        </div>

        <div :class="s.grid" class="reveal">
          <div :class="s.info">
            <div v-for="(c, i) in contacts" :key="i" :class="s.infoCard">
              <div :class="s.infoIcon">{{ c.icon }}</div>
              <h3 :class="s.infoTitle">{{ c.title }}</h3>
              <p :class="s.infoValue">{{ c.value }}</p>
            </div>
          </div>

          <div :class="s.formWrap">
            <h2 :class="s.formTitle">{{ t('contactPage.formTitle') }}</h2>
            <form :class="s.form" @submit.prevent="handleSubmit">
              <div :class="s.field">
                <label :class="s.label">{{ t('contactPage.name') }}</label>
                <input v-model="form.name" :class="s.input" required />
              </div>
              <div :class="s.field">
                <label :class="s.label">{{ t('contactPage.email') }}</label>
                <input v-model="form.email" type="email" :class="s.input" required />
              </div>
              <div :class="s.field">
                <label :class="s.label">{{ t('contactPage.message') }}</label>
                <textarea v-model="form.message" :class="s.textarea" rows="5" required />
              </div>
              <button type="submit" :class="s.submit" :disabled="submitting">
                {{ submitting ? t('contactPage.sending') : t('contactPage.send') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'contactPage.title', description: 'contactPage.subtitle' });
import { ref, onMounted, onUnmounted } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './contact.vue.module.css';

const { t } = useI18n();

const contacts = [
  { icon: '📧', title: t('contactPage.emailTitle'), value: 'hello@talentpro.com' },
  { icon: '📞', title: t('contactPage.phoneTitle'), value: '+86 400-888-8888' },
  { icon: '📍', title: t('contactPage.addressTitle'), value: t('contactPage.addressValue') },
];

const form = ref({ name: '', email: '', message: '' });
const submitting = ref(false);

onMounted(() => {
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t('contactPage.jsonLdName'),
    description: t('contactPage.jsonLdDesc'),
    url: 'https://talentpro.cn/about/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'TalentPro',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+86-400-888-8888',
        contactType: 'sales',
        areaServed: 'CN',
        availableLanguage: ['Chinese', 'English'],
      },
    },
  });
});
onUnmounted(removeJsonLd);

const handleSubmit = async () => {
  submitting.value = true;
  await new Promise((r) => setTimeout(r, 1000));
  import('@/utils/toast.js').then(({ showToast }) => showToast(t('contactPage.sent'), 'success'));
  form.value = { name: '', email: '', message: '' };
  submitting.value = false;
};
</script>
