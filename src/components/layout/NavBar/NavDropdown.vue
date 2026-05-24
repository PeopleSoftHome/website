<template>
  <div :class="s.dropdown">
    <div :class="s.grid">
      <a v-for="item in items" :key="item.title" :href="item.href" :class="s.item">
        <span :class="s.icon">{{ item.icon }}</span>
        <span :class="s.text">
          <strong :class="s.itemTitle">{{ item.title }}</strong>
          <span :class="s.itemDesc">{{ item.desc }}</span>
        </span>
      </a>
    </div>
    <template v-if="banner">
      <div :class="s.divider" />
      <a :href="banner.href" :class="s.banner">
        <span :class="s.bannerThumb">{{ banner.thumb }}</span>
        <span :class="s.bannerBody">
          <strong :class="s.bannerTitle">{{ banner.title }}</strong>
          <span :class="s.bannerDesc">{{ banner.desc }}</span>
        </span>
        <span :class="s.bannerArrow">→</span>
      </a>
    </template>
  </div>
</template>

<script setup>
import s from './NavDropdown.module.css';

defineProps({
  items:  { type: Array, default: () => [] },
  banner: { type: Object, default: null },
});
</script>
