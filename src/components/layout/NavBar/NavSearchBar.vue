<template>
  <div :class="[s.searchWrap, searchOpen ? s.searchExpanded : '', scrolled ? s.searchScrolled : '']">
    <button
      :class="s.searchIconBtn"
      @click="searchOpen ? closeSearchBar() : openSearchBar()"
      :aria-label="t('search.label')"
    >
      <Icon name="search" :size="16" />
    </button>
    <input
      ref="searchInputRef"
      :class="s.searchInput"
      type="text"
      v-model="searchQuery"
      @keydown="handleSearchKey"
      :placeholder="t('search.placeholder')"
      autocomplete="off"
    />
    <button :class="s.searchClose" @click="closeSearchBar" :aria-label="t('nav.searchClose')">
      <Icon name="close" :size="14" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useSearchStore } from '@/stores/search.pinia';
import Icon from '../../ui/Icon/Icon.vue';
import s from './NavBar.module.css';

defineProps<{ scrolled: boolean }>();

const { t } = useI18n();
const searchStore = useSearchStore();

const searchOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

let searchFocusTimer: ReturnType<typeof setTimeout> | null = null;

const openSearchBar = () => {
  searchOpen.value = true;
  searchFocusTimer = setTimeout(() => searchInputRef.value?.focus(), 50);
};

const closeSearchBar = () => {
  searchOpen.value = false;
  searchQuery.value = '';
};

const handleSearchKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && searchQuery.value.trim()) {
    searchStore.openSearch();
    closeSearchBar();
  }
  if (e.key === 'Escape') closeSearchBar();
};

onUnmounted(() => {
  if (searchFocusTimer) clearTimeout(searchFocusTimer);
});
</script>
