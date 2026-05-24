<template>
  <BaseModal
    :is-open="searchStore.isOpen.value"
    :aria-label="t('search.label')"
    :overlay-class-name="s.overlay"
    @close="searchStore.closeSearch()"
  >
    <div :class="s.modal">
      <div :class="s.inputRow">
        <span :class="s.searchIcon" aria-hidden="true">🔍</span>
        <input
          ref="inputRef"
          :class="s.input"
          type="text"
          :value="query"
          @input="handleQueryChange($event.target.value)"
          @keydown="handleKeyDown"
          :placeholder="t('search.placeholder')"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <div :class="s.inputRight">
          <span :class="s.shortcut" aria-hidden="true">{{ t('search.shortcut') }}</span>
          <button :class="s.escBtn" @click="searchStore.closeSearch()" :aria-label="t('modal.close')">ESC</button>
        </div>
      </div>

      <div :class="s.body">
        <!-- 无输入：热门搜索 -->
        <div v-if="!hasQuery" :class="s.hotSection">
          <div :class="s.hotTitle">{{ t('search.hot') }}</div>
          <div :class="s.hotTags">
            <button v-for="term in HOT_SEARCHES" :key="term" :class="s.hotTag" @click="handleQueryChange(term)">
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
              @click="selectItem(item)"
            >
              <span :class="s.resultIcon" aria-hidden="true">{{ item.icon }}</span>
              <span :class="s.resultBody">
                <span :class="s.resultTitle" v-html="highlight(item.title, query)" />
                <span :class="s.resultDesc" v-html="highlight(item.desc, query)" />
              </span>
              <span :class="s.resultArrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else :class="s.empty">
          <div :class="s.emptyIcon">🔭</div>
          <div :class="s.emptyTitle">{{ t('search.noResult', { query }) }}</div>
          <div :class="s.emptySub">{{ t('search.noResultSub') }}</div>
          <div :class="s.hotTags" style="justify-content:center;margin-top:16px">
            <button v-for="term in HOT_SEARCHES.slice(0, 4)" :key="term" :class="s.hotTag" @click="handleQueryChange(term)">
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
import { computed, watch, inject } from 'vue';
import { HOT_SEARCHES } from '@/data/searchIndex.js';
import { useSearch } from '@/composables/useSearch.js';
import BaseModal from '../BaseModal/BaseModal.vue';
import s from './SearchModal.module.css';

const { t } = inject('i18n', { t: (k) => k });
const searchStore = inject('search', { isOpen: { value: false }, closeSearch: () => {} });

const {
  query, handleQueryChange,
  groupedResults, focusIdx,
  totalResults, highlight,
  selectItem, handleKeyDown,
  inputRef, focusInput,
  TYPE_LABELS,
} = useSearch(() => searchStore.closeSearch());

const hasQuery = computed(() => query.value.trim().length > 0);
const hasResults = computed(() => totalResults.value > 0);
const resultEntries = computed(() => Object.entries(groupedResults.value));

// 打开时自动聚焦
watch(() => searchStore.isOpen.value, (open) => {
  if (open) focusInput();
});

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
