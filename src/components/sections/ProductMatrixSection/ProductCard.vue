<template>
  <div :class="[s.card, 'reveal', delayClass]">
    <div :class="s.icon" :style="iconStyles">
      <component :is="icon" v-if="typeof icon === 'function'" />
      <template v-else><Icon :name="icon" :size="20" /></template>
    </div>
    <div :class="s.name">{{ name }}</div>
    <p :class="s.desc">{{ desc }}</p>
    <span :class="s.link">{{ linkText || t('products.linkText') }} <Icon name="arrow-right" :size="12" /></span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Icon from '../../ui/Icon/Icon.vue';
import s from './ProductCard.module.css';

const { t } = useI18n();

const props = defineProps({
  icon:      { type: [Function, String], required: true },
  name:      { type: String, required: true },
  desc:      { type: String, required: true },
  iconBg:    { type: String, default: '' },
  iconColor: { type: String, default: '' },
  linkText:  { type: String, default: '' },
  delay:     { type: Number, default: 0 },
});

const delayClass = computed(() => props.delay > 0 ? `reveal-delay-${props.delay}` : '');
const iconStyles = computed(() => ({
  ...(props.iconBg ? { background: props.iconBg } : {}),
  ...(props.iconColor ? { color: props.iconColor } : {}),
}));
</script>
