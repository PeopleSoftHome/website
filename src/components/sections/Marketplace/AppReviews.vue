<template>
  <div :class="s.reviews" class="reveal">
    <h2 :class="s.title">{{ t('marketplace.reviews') }}</h2>
    <div :class="s.list">
      <div v-for="(r, i) in reviews" :key="i" :class="s.card" :style="{ '--stagger': i }">
        <div :class="s.header">
          <div :class="s.avatar">{{ r.user.charAt(0) }}</div>
          <div>
            <div :class="s.user">{{ r.user }}</div>
            <div :class="s.company">{{ r.company }}</div>
          </div>
          <div :class="s.rating">
            <span v-for="n in 5" :key="n" :class="[s.star, n <= r.rating && s.starActive]">★</span>
          </div>
        </div>
        <p :class="s.text">{{ r.text }}</p>
        <div :class="s.date">{{ r.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { REVIEWS } from '@/data/marketplace';
import s from './AppReviews.module.css';

const props = defineProps({ appSlug: { type: String, default: '' } });
const { t } = useI18n();

const reviews = computed(() => REVIEWS);
</script>
