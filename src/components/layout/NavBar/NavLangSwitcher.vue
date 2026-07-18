<template>
  <div :class="s.langWrap">
    <button
      :class="s.langBtn"
      @click="langMenuOpen = !langMenuOpen"
      :aria-label="t('nav.langLabel')"
      :aria-expanded="langMenuOpen"
    >
      <Icon name="globe" :size="14" /> {{ localeLabel(locale) ?? t('nav.langLabel') }} <Icon name="chevron-down" :size="12" />
    </button>
    <div v-if="langMenuOpen" :class="s.langMenu" role="menu">
      <button
        v-for="loc in localeOptions"
        :key="loc.key"
        role="menuitem"
        :class="[s.langOption, locale === loc.key ? s.langActive : '']"
        @click="pickLang(loc.key)"
      >
        {{ loc.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Icon from '../../ui/Icon/Icon.vue';
import s from './NavBar.module.css';

const { t, locale, setLocale } = useI18n();

const langMenuOpen = ref(false);

const localeOptions = computed(() => [
  { key: 'zh', label: t('nav.lang.zh') },
  { key: 'en', label: t('nav.lang.en') },
  { key: 'zh-TW', label: t('nav.lang.zhTw') },
]);
const localeLabel = (code: string) => localeOptions.value.find((l: { key: string; label: string }) => l.key === code)?.label;

const pickLang = (l: string) => {
  setLocale(l as 'zh' | 'en' | 'zh-TW');
  langMenuOpen.value = false;
};
</script>
