<template>
  <div v-if="caseStudy" :class="s.caseStudy" class="reveal">
    <div :class="s.caseHeader">
      <div :class="s.caseLogo">{{ caseStudy.client.charAt(0) }}</div>
      <div>
        <span :class="s.caseLabel">{{ t('solutions.caseStudy') }}</span>
        <h3 :class="s.caseTitle">{{ caseStudy.client }}</h3>
        <p :class="s.caseMeta">{{ caseStudy.industry }} · {{ caseStudy.scale }}</p>
      </div>
    </div>
    <div :class="s.caseBody">
      <div :class="s.caseBlock">
        <h4>{{ t('solutions.challenge') }}</h4>
        <p>{{ caseStudy.challenge }}</p>
      </div>
      <div :class="s.caseBlock">
        <h4>{{ t('solutions.solution') }}</h4>
        <p>{{ caseStudy.solution }}</p>
      </div>
      <div :class="s.caseBlock">
        <h4>{{ t('solutions.results') }}</h4>
      </div>
    </div>
    <div v-if="caseStudy.results?.length" :class="s.caseMetrics">
      <div v-for="(m, i) in caseStudy.results" :key="i" :class="s.caseMetric">
        <span :class="s.caseMetricValue"><StatCounter :value="m.value" /></span>
        <span :class="s.caseMetricLabel">{{ m.label }}</span>
      </div>
    </div>
    <div v-if="caseStudy.quote" :class="s.caseQuote">
      <div :class="s.quoteMark">"</div>
      <p>{{ caseStudy.quote }}</p>
      <div :class="s.quoteAuthor">
        <div :class="s.authorAvatar">{{ caseStudy.author.charAt(0) }}</div>
        <div>
          <span>{{ caseStudy.author }}</span>
          <span>{{ caseStudy.title }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="roi?.length" :class="s.section">
    <h2 :class="s.sectionTitle">{{ t('solutions.roi') }}</h2>
    <div :class="s.roiCalc">
      <div :class="s.calcForm">
        <label>
          {{ t('solutions.employees') }}
          <input v-model.number="calcEmployees" type="number" min="1" />
        </label>
        <label>
          {{ t('solutions.avgSalary') }}
          <input v-model.number="calcSalary" type="number" min="1" />
        </label>
        <div :class="s.calcResult">
          {{ t('solutions.annualSavings') }}: ¥{{ calcSavings }}
        </div>
      </div>
    </div>
    <div :class="s.roiGrid">
      <div v-for="(r, i) in roi" :key="i" :class="s.roiCard">
        <span :class="s.roiMetric">{{ r.metric }}</span>
        <span :class="s.roiValue">{{ r.value }}</span>
        <span :class="s.roiDesc">{{ r.desc }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import StatCounter from '@/components/ui/StatCounter/StatCounter.vue';
import s from './SolutionCaseDeep.vue.module.css';

interface RoiItem {
  metric: string;
  value: string;
  desc: string;
}

const props = defineProps({
  caseStudy: { type: Object, default: null },
  roi: { type: Array as () => RoiItem[], default: () => [] },
});

const { t } = useI18n();
const calcEmployees = ref(500);
const calcSalary = ref(12000);

const calcSavings = computed(() => {
  const annual = calcEmployees.value * calcSalary.value * 12 * 0.15;
  return Math.round(annual).toLocaleString('zh-CN');
});
</script>
