<template>
  <div :class="s.section" class="reveal">
    <SectionHeader :title="t('productPage.features')" align="left" />
    <div :class="s.featureGrid">
      <div
        v-for="(f, i) in features"
        :key="i"
        :class="[s.featureCard, expandedIdx === i && s.featureCardExpanded]"
        @mouseenter="expandedIdx = i"
        @mouseleave="expandedIdx = -1"
      >
        <div :class="s.featureTop">
          <div :class="s.featureBadge">0{{ i + 1 }}</div>
          <h3 :class="s.featureTitle">{{ f.title }}</h3>
          <p :class="s.featureDesc">{{ f.desc }}</p>
        </div>
        <div v-if="f.detail" :class="s.featureDetail">
          <p>{{ f.detail }}</p>
        </div>
        <span v-if="f.detail" :class="s.featureArrow">{{ t('productPage.learnMore') }} &rarr;</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader.vue';
import s from './ProductFeatureCards.vue.module.css';

defineProps({ features: { type: Array, default: () => [] } });
const { t } = useI18n();
const expandedIdx = ref(-1);
</script>
