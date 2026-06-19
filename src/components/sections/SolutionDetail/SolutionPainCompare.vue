<template>
  <div :class="s.section" class="reveal">
    <h2 :class="s.sectionTitle">{{ t('solutions.painPoints') }}</h2>
    <div :class="s.painGrid">
      <div v-for="(p, i) in painPoints" :key="i" :class="s.painCard">
        <div :class="s.painBefore">
          <div :class="s.painBadgeBad"><span>❌</span> {{ t('solutions.pain') }}</div>
          <h3>{{ p.title }}</h3>
          <p>{{ p.desc }}</p>
        </div>
        <div :class="s.painArrow">→</div>
        <div :class="s.painAfter">
          <div :class="s.painBadgeGood"><span>✓</span> {{ t('solutions.solution') }}</div>
          <h3>{{ solutions[i]?.title }}</h3>
          <p>{{ solutions[i]?.desc }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="solutions.length" :class="s.section" class="reveal">
    <h2 :class="s.sectionTitle">{{ t('solutions.architecture') }}</h2>
    <div :class="s.archFlow">
      <div v-for="(a, i) in solutions" :key="i" :class="s.archNode" class="reveal">
        <div :class="s.archCircle">0{{ i + 1 }}</div>
        <h3>{{ a.title }}</h3>
        <p>{{ a.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import s from './SolutionPainCompare.vue.module.css';

defineProps({ painPoints: { type: Array, default: () => [] }, solutions: { type: Array, default: () => [] } });
const { t } = useI18n();
</script>
