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
              <div :class="s.row2">
                <div :class="s.field">
                  <label :for="'contactName'" :class="s.label">{{ t('contactPage.name') }}</label>
                  <input id="contactName" v-model="form.name" :class="s.input" required />
                </div>
                <div :class="s.field">
                  <label :for="'contactCompany'" :class="s.label">{{ t('contactPage.company') }}</label>
                  <input id="contactCompany" v-model="form.company" :class="s.input" />
                </div>
              </div>
              <div :class="s.row2">
                <div :class="s.field">
                  <label :for="'contactEmail'" :class="s.label">{{ t('contactPage.email') }}</label>
                  <input id="contactEmail" v-model="form.email" type="email" :class="s.input" required />
                </div>
                <div :class="s.field">
                  <label :for="'contactInquiryType'" :class="s.label">{{ t('contactPage.inquiryType') }}</label>
                  <select id="contactInquiryType" v-model="form.inquiryType" :class="s.input">
                    <option value="">{{ t('contactPage.inquiryPlaceholder') }}</option>
                    <option value="product">{{ t('contactPage.inquiryProduct') }}</option>
                    <option value="demo">{{ t('contactPage.inquiryDemo') }}</option>
                    <option value="partner">{{ t('contactPage.inquiryPartner') }}</option>
                    <option value="support">{{ t('contactPage.inquirySupport') }}</option>
                    <option value="other">{{ t('contactPage.inquiryOther') }}</option>
                  </select>
                </div>
              </div>
              <div :class="s.field">
                <label :for="'contactMessage'" :class="s.label">{{ t('contactPage.message') }}</label>
                <textarea id="contactMessage" v-model="form.message" :class="s.textarea" rows="5" required />
              </div>
              <button type="submit" :class="s.submit" :disabled="submitting">
                {{ submitting ? t('contactPage.sending') : t('contactPage.send') }}
              </button>
            </form>
          </div>
        </div>

        <!-- FAQ -->
        <div :class="s.faq" class="reveal">
          <h2 :class="s.sectionTitle">{{ t('contactPage.faq') }}</h2>
          <div :class="s.faqList">
            <div v-for="(item, i) in faq" :key="i" :class="[s.faqItem, openFaq === i && s.faqItemOpen]">
              <button :class="s.faqQ" @click="openFaq = openFaq === i ? -1 : i">
                <span>{{ item.q }}</span>
                <span :class="s.faqIcon">{{ openFaq === i ? '−' : '+' }}</span>
              </button>
              <div v-show="openFaq === i" :class="s.faqA">
                <p>{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'contactPage.title', description: 'contactPage.subtitle' });
import { ref, computed } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb/Breadcrumb.vue';
import { getContactFaq } from '@/data/contact';
import { useJsonLd } from '@/utils/jsonld';
import s from './contact.module.css';

const { t, locale } = useI18n();
const openFaq = ref(-1);

const contacts = [
  { icon: '📧', title: t('contactPage.emailTitle'), value: 'hello@talentpro.com' },
  { icon: '📞', title: t('contactPage.phoneTitle'), value: '+86 400-888-8888' },
  { icon: '📍', title: t('contactPage.addressTitle'), value: t('contactPage.addressValue') },
];

const faq = computed(() => getContactFaq(locale.value));

const form = ref({ name: '', email: '', company: '', inquiryType: '', message: '' });
const submitting = ref(false);

useJsonLd({
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

const handleSubmit = async () => {
  submitting.value = true;
  await new Promise((r) => setTimeout(r, 1000));
  import('@/utils/toast').then(({ showToast }) => showToast(t('contactPage.sent'), 'success'));
  form.value = { name: '', email: '', company: '', inquiryType: '', message: '' };
  submitting.value = false;
};
</script>
