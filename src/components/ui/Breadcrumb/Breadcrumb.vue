<template>
  <nav :class="s.breadcrumb" aria-label="breadcrumb">
    <ol :class="s.list">
      <li :class="s.item">
        <router-link to="/" :class="s.link">{{ t('nav.home') }}</router-link>
      </li>
      <li v-for="(item, i) in items" :key="i" :class="s.item">
        <span :class="s.sep">/</span>
        <router-link v-if="item.to" :to="item.to" :class="s.link">{{ item.label }}</router-link>
        <span v-else :class="s.current">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import s from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

defineProps({
  items: { type: Array as () => BreadcrumbItem[], default: () => [] },
});

const { t } = useI18n();
</script>
