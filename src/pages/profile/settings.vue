<template>
  <div>
    <div :class="s.header" class="reveal">
      <h2 :class="s.title">{{ t('profile.menu.settings') }}</h2>
    </div>

    <div :class="s.panel" class="reveal">
      <h3 :class="s.sectionTitle">{{ t('profile.basicInfo') }}</h3>
      <div :class="s.form">
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.name') }}</label>
          <input v-model="form.name" :class="s.input" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.email') }}</label>
          <input v-model="form.email" type="email" :class="s.input" disabled />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.phone') }}</label>
          <input v-model="form.phone" :class="s.input" placeholder="+86" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.company') }}</label>
          <input v-model="form.company" :class="s.input" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.jobTitle') }}</label>
          <input v-model="form.jobTitle" :class="s.input" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.bio') }}</label>
          <textarea v-model="form.bio" :class="s.textarea" rows="3" />
        </div>
      </div>
    </div>

    <div :class="s.panel" class="reveal">
      <h3 :class="s.sectionTitle">{{ t('profile.preferences') }}</h3>
      <div :class="s.prefList">
        <div :class="s.prefItem">
          <div>
            <div :class="s.prefName">{{ t('profile.prefLang') }}</div>
            <div :class="s.prefDesc">{{ t('profile.prefLangDesc') }}</div>
          </div>
          <select v-model="form.language" :class="s.select">
            <option value="zh">{{ t('nav.lang.zh') }}</option>
            <option value="en">{{ t('nav.lang.en') }}</option>
            <option value="zh-TW">{{ t('nav.lang.zhTw') }}</option>
          </select>
        </div>
        <div :class="s.prefItem">
          <div>
            <div :class="s.prefName">{{ t('profile.prefNotif') }}</div>
            <div :class="s.prefDesc">{{ t('profile.prefNotifDesc') }}</div>
          </div>
          <button :class="[s.toggle, form.emailNotif && s.toggleOn]" @click="form.emailNotif = !form.emailNotif">
            <span :class="s.toggleKnob" />
          </button>
        </div>
        <div :class="s.prefItem">
          <div>
            <div :class="s.prefName">{{ t('profile.prefMarketing') }}</div>
            <div :class="s.prefDesc">{{ t('profile.prefMarketingDesc') }}</div>
          </div>
          <button :class="[s.toggle, form.marketing && s.toggleOn]" @click="form.marketing = !form.marketing">
            <span :class="s.toggleKnob" />
          </button>
        </div>
      </div>
    </div>

    <div :class="s.actions" class="reveal">
      <button :class="s.saveBtn" :disabled="saving" @click="handleSave">
        {{ saving ? t('comment.submitting') : t('profile.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'profile.menu.settings', requiresAuth: true });
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia';
import { userApi } from '@/api/user';
import s from './settings.module.css';

const { t } = useI18n();
const auth = useAuthStore();

const saving = ref(false);
const form = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  company: auth.user?.company || '',
  jobTitle: auth.user?.jobTitle || '',
  bio: auth.user?.bio || '',
  language: 'zh',
  emailNotif: true,
  marketing: false,
});

const handleSave = async () => {
  saving.value = true;
  try {
    const res = await userApi.updateProfile({
      name: form.value.name,
      bio: form.value.bio,
      phone: form.value.phone,
      company: form.value.company,
      jobTitle: form.value.jobTitle,
    });
    const updated = (res.data || res)?.user || res.data || res;
    auth.setUser(updated);
    import('@/utils/toast').then(({ showToast }) => showToast(t('profile.saveSuccess'), 'success'));
  } catch (e) {
    const err = e as { response?: { data?: { message?: string } } };
    import('@/utils/toast').then(({ showToast }) => showToast(err.response?.data?.message || t('profile.saveError'), 'error'));
  }
  saving.value = false;
};
</script>
