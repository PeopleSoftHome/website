<template>
  <div>
    <div :class="s.header" class="reveal">
      <h2 :class="s.title">{{ t('profile.menu.security') }}</h2>
    </div>

    <!-- Password -->
    <div :class="s.panel" class="reveal">
      <h3 :class="s.sectionTitle">{{ t('profile.changePassword') }}</h3>
      <div :class="s.form">
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.currentPassword') }}</label>
          <input v-model="pwd.current" type="password" :class="s.input" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.newPassword') }}</label>
          <input v-model="pwd.new" type="password" :class="s.input" />
        </div>
        <div :class="s.field">
          <label :class="s.label">{{ t('profile.confirmPassword') }}</label>
          <input v-model="pwd.confirm" type="password" :class="s.input" />
        </div>
      </div>
      <div :class="s.panelActions">
        <button :class="s.btnPrimary" :disabled="pwdSaving" @click="handleChangePassword">
          {{ pwdSaving ? t('comment.submitting') : t('profile.updatePassword') }}
        </button>
      </div>
    </div>

    <!-- 2FA -->
    <div :class="s.panel" class="reveal">
      <div :class="s.prefItem">
        <div>
          <div :class="s.prefName">{{ t('profile.twoFA') }}</div>
          <div :class="s.prefDesc">{{ t('profile.twoFADesc') }}</div>
        </div>
        <button :class="[s.toggle, twoFA && s.toggleOn]" @click="twoFA = !twoFA">
          <span :class="s.toggleKnob" />
        </button>
      </div>
    </div>

    <!-- Login history -->
    <div :class="s.panel" class="reveal">
      <h3 :class="s.sectionTitle">{{ t('profile.loginHistory') }}</h3>
      <div :class="s.historyTable">
        <div :class="s.historyHead">
          <span>{{ t('profile.loginTime') }}</span>
          <span>{{ t('profile.loginDevice') }}</span>
          <span>{{ t('profile.loginIp') }}</span>
          <span>{{ t('profile.loginLocation') }}</span>
          <span>{{ t('profile.loginStatus') }}</span>
        </div>
        <div v-for="(item, i) in loginHistory" :key="i" :class="s.historyRow">
          <span>{{ item.date }}</span>
          <span>{{ item.device }}</span>
          <span>{{ item.ip }}</span>
          <span>{{ item.location }}</span>
          <span>
            <span v-if="item.current" :class="s.currentTag">{{ t('profile.currentSession') }}</span>
            <span v-else :class="s.pastTag">—</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'profile.menu.security', requiresAuth: true });
import { ref } from 'vue';
import { LOGIN_HISTORY } from '@/data/profile.js';
import s from './security.module.css';

const { t } = useI18n();

const pwd = ref({ current: '', new: '', confirm: '' });
const pwdSaving = ref(false);
const twoFA = ref(false);

const loginHistory = LOGIN_HISTORY;

const handleChangePassword = async () => {
  if (!pwd.value.current || !pwd.value.new || !pwd.value.confirm) {
    import('@/utils/toast.js').then(({ showToast }) => showToast(t('profile.fillAll'), 'warning'));
    return;
  }
  if (pwd.value.new !== pwd.value.confirm) {
    import('@/utils/toast.js').then(({ showToast }) => showToast(t('profile.passwordMismatch'), 'error'));
    return;
  }
  pwdSaving.value = true;
  await new Promise((r) => setTimeout(r, 800));
  import('@/utils/toast.js').then(({ showToast }) => showToast(t('profile.passwordUpdated'), 'success'));
  pwd.value = { current: '', new: '', confirm: '' };
  pwdSaving.value = false;
};
</script>
