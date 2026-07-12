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
import { getMarketplaceReviews } from '@/data/marketplace';
import { marketplaceApi } from '@/api/marketplace';
import { formatDate } from '@/shared/utils/date';
import s from './AppReviews.module.css';

interface Review {
  user: string;
  company: string;
  rating: number;
  text: string;
  date: string;
}

const props = defineProps({ appSlug: { type: String, default: '' } });
const { t, locale } = useI18n();

const fallbackReviews = computed(() => getMarketplaceReviews(locale.value));

const { data: apiReviews } = useAsyncData(
  () => `marketplace-reviews-${locale.value}-${props.appSlug}`,
  async () => {
    const res = await marketplaceApi.getReviews(props.appSlug, { pageSize: 6 });
    const list = (res?.data?.data || res?.data || res || []) as any[];
    return list.map((r: any) => ({
      user: r.user?.name || r.userName || t('marketplace.anonymousUser'),
      company: r.user?.company || r.company || '',
      rating: r.rating || 5,
      text: r.comment || r.text || '',
      date: r.createdAt ? formatDate(r.createdAt) : '',
    } as Review));
  },
  { server: false, default: () => [] as Review[], watch: [() => props.appSlug, locale] }
);

const reviews = computed<Review[]>(() => apiReviews.value?.length ? apiReviews.value : fallbackReviews.value);
</script>
