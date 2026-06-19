<template>
  <BaseModal
    :is-open="searchStore.isOpen.value"
    :aria-label="t('search.label')"
    :overlay-class-name="s.overlay"
    @close="searchStore.closeSearch()"
  >
    <div :class="s.modal">
      <div :class="s.inputRow">
        <span :class="s.searchIcon" aria-hidden="true">
          <Icon name="search" :size="18" />
        </span>
        <input
          ref="inputRef"
          :class="s.input"
          type="text"
          :value="query"
          @input="handleQueryChange($event.target.value)"
          @keydown="trackedHandleKeyDown"
          :placeholder="t('search.placeholder')"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <div :class="s.inputRight">
          <span :class="s.shortcut" aria-hidden="true">{{ t('search.shortcut') }}</span>
          <button :class="s.escBtn" @click="searchStore.closeSearch()" :aria-label="t('modal.close')">
            <Icon name="close" :size="14" /> ESC
          </button>
        </div>
      </div>

      <div :class="s.body">
        <!-- 搜索建议 -->
        <div v-if="hasQuery && suggestions.length > 0 && !hasResults" :class="s.suggestions">
          <div v-for="sug in suggestions.slice(0, 6)" :key="sug" :class="s.suggestionItem" @click="handleQueryChange(sug)">
            <Icon name="search" :size="14" />
            <span>{{ sug }}</span>
          </div>
        </div>

        <!-- 无输入：热门搜索 -->
        <div v-if="!hasQuery" :class="s.hotSection">
          <div :class="s.hotTitle">{{ t('search.hot') }}</div>
          <div :class="s.hotTags">
            <button v-for="term in displayHotSearches" :key="term" :class="s.hotTag" @click="handleQueryChange(term)">
              {{ term }}
            </button>
          </div>
        </div>

        <!-- 有结果 -->
        <div v-else-if="hasResults" :class="s.results">
          <div v-for="[type, items] in resultEntries" :key="type" :class="s.group">
            <div :class="s.groupHeader">
              <span :class="s.groupLabel">{{ TYPE_LABELS[type] ?? type }}</span>
              <span :class="s.groupCount">{{ items.length }}</span>
            </div>
            <button
              v-for="(item, idx) in items"
              :key="item.id"
              :class="[s.resultItem, getGlobalIdx(type, idx) === focusIdx ? s.resultActive : '']"
              @click="trackedSelectItem(item)"
            >
              <span :class="s.resultIcon" aria-hidden="true"><Icon :name="item.icon" :size="18" /></span>
              <span :class="s.resultBody">
                <span :class="s.resultTitle" v-html="highlight(item.title, query)" />
                <span :class="s.resultDesc" v-html="highlight(item.desc, query)" />
              </span>
              <span :class="s.resultArrow" aria-hidden="true">
                <Icon name="chevron-right" :size="16" />
              </span>
            </button>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else :class="s.empty">
          <div :class="s.emptyIcon">
            <Icon name="inbox" :size="40" color="var(--gray-300)" />
          </div>
          <div :class="s.emptyTitle">{{ t('search.noResult', { query }) }}</div>
          <div :class="s.emptySub">{{ t('search.noResultSub') }}</div>
          <div :class="s.hotTags" style="justify-content:center;margin-top:16px">
            <button v-for="term in displayHotSearches.slice(0, 4)" :key="term" :class="s.hotTag" @click="handleQueryChange(term)">
              {{ term }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasResults" :class="s.footer">
        <span>{{ t('search.navUp') }}</span>
        <span>{{ t('search.navEnter') }}</span>
        <span>{{ t('search.navEsc') }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, watch, inject, onUnmounted } from 'vue';
import { HOT_SEARCHES } from '@/data/searchIndex.js';
import { useSiteConfig } from '@/composables/useSiteConfig.js';
import { useSearch } from '@/composables/useSearch.js';
import Icon from '../Icon/Icon.vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import s from './SearchModal.module.css';

const { t } = useI18n();
const searchStore = inject('search', { isOpen: { value: false }, closeSearch: () => {} });
const analytics = inject('analytics', { track: () => {} });

const {
  query, handleQueryChange,
  groupedResults, focusIdx,
  totalResults, highlight,
  selectItem, handleKeyDown,
  inputRef, focusInput,
  TYPE_LABELS, debouncedQuery, flatResults,
  suggestions,
} = useSearch(() => searchStore.closeSearch());

const { hotTags: cmsHotTags } = useSiteConfig();
const displayHotSearches = computed(() => (cmsHotTags.value.length ? cmsHotTags.value : HOT_SEARCHES));

const trackedSelectItem = (item) => {
  analytics.track('search_click', { id: item.id, type: item.type, query: query.value });
  selectItem(item);
};

// 搜索查询埋点（防抖，至少 2 个字符）
let searchQueryTimer = null;
watch(() => debouncedQuery.value, (q) => {
  if (q && q.length >= 2) {
    clearTimeout(searchQueryTimer);
    searchQueryTimer = setTimeout(() => {
      analytics.track('search_query', { query: q });
    }, 300);
  }
});

onUnmounted(() => {
  clearTimeout(searchQueryTimer);
});

const hasQuery = computed(() => query.value.trim().length > 0);
const hasResults = computed(() => totalResults.value > 0);
const resultEntries = computed(() => Object.entries(groupedResults.value));

// 打开时自动聚焦
watch(() => searchStore.isOpen.value, (open) => {
  if (open) focusInput();
});

// Enter 选择时也会触发 search_click（在 handleKeyDown 内部已调用 selectItem）
// 为了埋点，需要包装 handleKeyDown
const trackedHandleKeyDown = (e) => {
  if (e.key === 'Enter' && focusIdx.value >= 0) {
    const item = flatResults.value[focusIdx.value];
    if (item) analytics.track('search_click', { id: item.id, type: item.type, query: query.value });
  }
  handleKeyDown(e);
};

// 计算全局索引（用于 focusIdx 对照）
const getGlobalIdx = (type, idx) => {
  let count = 0;
  for (const [t, items] of Object.entries(groupedResults.value)) {
    if (t === type) return count + idx;
    count += items.length;
  }
  return -1;
};
</script>
