<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <div :class="s.hero" class="reveal">
          <h1 :class="s.title">{{ t('pricing.title') }}</h1>
          <p :class="s.subtitle">{{ t('pricing.subtitle') }}</p>
        </div>

        <div :class="s.grid">
          <div
            v-for="(tier, i) in tiers"
            :key="tier.name"
            :class="[s.card, i === 1 ? s.cardHighlight : '', 'reveal', `reveal-delay-${i}`]"
          >
            <span v-if="tier.badge" :class="s.badge">{{ tier.badge }}</span>
            <div :class="s.tierName">{{ tier.name }}</div>
            <div :class="s.tierPrice">
              <template v-if="tier.price">
                <span :class="s.priceNum">{{ tier.price }}</span>
                <span :class="s.priceUnit">{{ t('pricing.perPerson') }}</span>
              </template>
              <span v-else :class="s.priceCustom">{{ t('pricing.custom') }}</span>
            </div>
            <p :class="s.tierDesc">{{ tier.desc }}</p>
            <ul :class="s.features">
              <li v-for="f in tier.features" :key="f" :class="s.featureItem">
                <Icon name="check" :size="14" color="var(--primary)" />
                <span>{{ f }}</span>
              </li>
            </ul>
            <Button
              :variant="i === 1 ? 'primary' : 'outline'"
              size="md"
              :class="s.tierCta"
              @click="modalStore.openModal()"
            >
              {{ tier.cta }}
            </Button>
          </div>
        </div>

        <div :class="s.included" class="reveal">
          <div :class="s.includedTitle">{{ t('pricing.includedTitle') }}</div>
          <div :class="s.includedList">
            <span v-for="item in included" :key="item" :class="s.includedItem">
              <Icon name="check" :size="14" color="var(--primary)" />
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from '@/components/ui/Icon/Icon.vue';
import Button from '@/components/ui/Button/Button.vue';
import s from './pricing.module.css';

interface PricingTier {
  name: string;
  price: string;
  desc: string;
  cta: string;
  badge: string;
  features: string[];
}

const { t, tm } = useI18n();
const modalStore = useModalStore();

const tiers = computed(() => (tm('pricing.tiers') as unknown as PricingTier[]) || []);
const included = computed(() => (tm('pricing.included') as unknown as string[]) || []);

useHead({
  title: t('pricing.title'),
  meta: [{ name: 'description', content: t('pricing.subtitle') }],
});
</script>
