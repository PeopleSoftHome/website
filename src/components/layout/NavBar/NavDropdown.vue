<template>
  <div :class="s.dropdown">
    <div :class="s.grid">
      <a v-for="item in items" :key="item.title" :href="item.href" :class="s.item">
        <span :class="s.icon"><Icon :name="item.icon" :size="20" /></span>
        <span :class="s.text">
          <strong :class="s.itemTitle">{{ item.title }}</strong>
          <span :class="s.itemDesc">{{ item.desc }}</span>
        </span>
      </a>
    </div>
    <template v-if="banner">
      <div :class="s.divider" />
      <a :href="banner.href" :class="s.banner">
        <span :class="s.bannerThumb"><Icon :name="banner.thumb" :size="20" /></span>
        <span :class="s.bannerBody">
          <strong :class="s.bannerTitle">{{ banner.title }}</strong>
          <span :class="s.bannerDesc">{{ banner.desc }}</span>
        </span>
        <span :class="s.bannerArrow"><Icon name="arrow-right" :size="16" /></span>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import Icon from '../../ui/Icon/Icon.vue';
import s from './NavDropdown.module.css';

interface NavDropdownItem {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface NavDropdownBanner {
  thumb: string;
  title: string;
  desc: string;
  href: string;
}

defineProps({
  items:  { type: Array as () => NavDropdownItem[], default: () => [] },
  banner: { type: Object as () => NavDropdownBanner | null, default: null },
});
</script>
