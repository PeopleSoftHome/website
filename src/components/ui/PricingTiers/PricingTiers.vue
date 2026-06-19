<template>
  <div :class="s.wrap">
    <div :class="s.toggle" class="reveal">
      <button
        :class="[s.toggleBtn, billing === 'monthly' ? s.toggleActive : '']"
        @click="billing = 'monthly'"
      >
        {{ t('marketplace.monthly') }}
      </button>
      <button
        :class="[s.toggleBtn, billing === 'yearly' ? s.toggleActive : '']"
        @click="billing = 'yearly'"
      >
        {{ t('marketplace.yearly') }}
        <span v-if="hasYearlyDiscount" :class="s.discountBadge">{{ t('marketplace.yearlySave') }}</span>
      </button>
    </div>

    <div :class="s.grid" class="reveal reveal-delay-1">
      <div
        v-for="(tier, i) in tiers"
        :key="i"
        :class="[s.tier, tier.highlight ? s.tierHighlight : '']"
      >
        <div :class="s.tierHeader">
          <h4 :class="s.tierName">{{ tier.name }}</h4>
          <p :class="s.tierDesc">{{ tier.desc }}</p>
        </div>
        <div :class="s.tierPrice">
          <span :class="s.priceNum">{{ priceText(tier) }}</span>
          <span :class="s.priceUnit">/{{ billing === 'monthly' ? t('marketplace.monthShort') : t('marketplace.yearShort') }}</span>
        </div>
        <ul :class="s.tierFeatures">
          <li v-for="(f, fi) in tier.features" :key="fi" :class="s.featureItem">
            <span :class="s.check">✓</span>
            <span>{{ f }}</span>
          </li>
        </ul>
        <button :class="[s.tierBtn, tier.highlight ? s.tierBtnPrimary : '']" @click="emit('select', tier)">
          {{ tier.cta || t('marketplace.choosePlan') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import s from './PricingTiers.module.css';

interface PricingTier {
  name: string;
  desc?: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlight?: boolean;
  cta?: string;
}

const props = defineProps({
  tiers: { type: Array as () => PricingTier[], required: true },
});

const emit = defineEmits(['select']);

const { t } = useI18n();

const billing = ref('monthly');

const hasYearlyDiscount = computed(() => {
  return props.tiers.some((t) => t.priceYearly && t.priceMonthly && t.priceYearly < t.priceMonthly * 12 * 0.85);
});

function priceText(tier: PricingTier) {
  const price = billing.value === 'monthly' ? tier.priceMonthly : tier.priceYearly;
  if (price === 0) return t('marketplace.free');
  return `¥${price.toLocaleString()}`;
}
</script>
