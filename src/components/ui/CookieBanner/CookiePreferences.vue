<template>
  <div :class="s.preferences">
    <h3 :class="s.prefTitle">{{ t('cookie.prefTitle') }}</h3>
    <p :class="s.prefDesc">{{ t('cookie.prefDesc') }}</p>

    <ul :class="s.list">
      <li :class="s.item">
        <div :class="s.itemHead">
          <span :class="s.itemLabel">{{ t('cookie.necessary') }}</span>
          <span :class="s.badgeAlways">{{ t('cookie.alwaysOn') }}</span>
        </div>
        <p :class="s.itemDesc">{{ t('cookie.necessaryDesc') }}</p>
      </li>

      <li :class="s.item">
        <div :class="s.itemHead">
          <span :class="s.itemLabel">{{ t('cookie.analytics') }}</span>
          <label :class="s.switch">
            <input
              type="checkbox"
              v-model="prefAnalytics"
              :aria-label="t('cookie.analytics')"
            />
            <span :class="s.slider" />
          </label>
        </div>
        <p :class="s.itemDesc">{{ t('cookie.analyticsDesc') }}</p>
      </li>

      <li :class="s.item">
        <div :class="s.itemHead">
          <span :class="s.itemLabel">{{ t('cookie.marketing') }}</span>
          <label :class="s.switch">
            <input
              type="checkbox"
              v-model="prefMarketing"
              :aria-label="t('cookie.marketing')"
            />
            <span :class="s.slider" />
          </label>
        </div>
        <p :class="s.itemDesc">{{ t('cookie.marketingDesc') }}</p>
      </li>
    </ul>

    <div :class="s.prefActions">
      <button type="button" :class="s.btnReject" @click="emit('reject')">
        {{ t('cookie.rejectAll') }}
      </button>
      <button type="button" :class="s.btnSave" @click="handleSave">
        {{ t('cookie.savePrefs') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import s from './CookieBanner.module.css';

const emit = defineEmits(['reject', 'save']);

const { t } = useI18n();

const prefAnalytics = ref(false);
const prefMarketing = ref(false);

const handleSave = () => {
  emit('save', { analytics: prefAnalytics.value, marketing: prefMarketing.value });
};
</script>
