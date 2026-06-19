<template>
  <div :class="s.pricingGrid">
    <div v-for="(tier, i) in tiers" :key="i" :class="[s.pricingCard, i === 1 && s.pricingCardHighlight]" @click="$emit('select', i)">
      <div v-if="i === 1" :class="s.recommended">{{ t('marketplace.recommended') }}</div>
      <h3 :class="s.pricingName">{{ tier.name }}</h3>
      <div :class="s.pricingPrice">
        <span v-if="tier.priceMonthly === 0" :class="s.priceFree">{{ t('marketplace.priceFree') }}</span>
        <template v-else>
          <span :class="s.priceCurrency">¥</span>
          <span :class="s.priceValue">{{ tier.priceMonthly }}</span>
          <span :class="s.priceUnit">/ {{ t('marketplace.month') }}</span>
        </template>
      </div>
      <p :class="s.pricingDesc">{{ tier.desc }}</p>
      <ul :class="s.pricingFeatures">
        <li v-for="(feat, j) in tier.features" :key="j">✓ {{ feat }}</li>
      </ul>
      <button v-if="tier.priceMonthly > 0" :class="[s.pricingBtn, selected === i ? s.pricingBtnPrimary : '']" @click.stop="$emit('subscribe', tier)">
        {{ t('marketplace.subscribeNow') }}
      </button>
      <button v-else :class="[s.pricingBtn, s.pricingBtnPrimary]" @click.stop="$emit('freeInstall')">
        {{ t('marketplace.freeInstall') }}
      </button>
      <button v-if="tier.priceMonthly > 0" :class="s.pricingBtnSecondary" @click.stop="$emit('addToCart', tier)">
        {{ t('marketplace.addToCart') }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ tiers: { type: Array, required: true }, selected: { type: Number, default: 0 } });
defineEmits(['select', 'subscribe', 'addToCart', 'freeInstall']);
import s from './AppPricing.module.css';
const { t } = useI18n();
</script>
