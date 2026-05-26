<template>
  <section :class="s.section" id="roi-calculator">
    <div class="container">
      <RevealWrapper>
        <SectionHeader
          :tag="t('roi.sectionTag')"
          :title="t('roi.sectionTitle')"
          :subtitle="t('roi.sectionSub')"
        />
      </RevealWrapper>

      <div :class="s.wrapper">
        <!-- 左侧：参数输入 -->
        <div :class="s.params">
          <div
            v-for="field in fields"
            :key="field.key"
            :class="s.field"
          >
            <div :class="s.fieldHeader">
              <label :class="s.label">{{ t(field.labelKey) }}</label>
              <span :class="s.valueDisplay">{{ formatValue(field) }}</span>
            </div>
            <input
              type="range"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              v-model.number="calc[field.key]"
              :class="s.slider"
              :aria-label="t(field.labelKey)"
            />
            <div :class="s.rangeLabels">
              <span>{{ formatMinMax(field.min, field.unit) }}</span>
              <span>{{ formatMinMax(field.max, field.unit) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：结果展示 -->
        <div :class="s.results">
          <!-- 核心数字 -->
          <div :class="s.cards">
            <div :class="s.resultCard">
              <p :class="s.resultLabel">{{ t('roi.totalSavings') }}</p>
              <p :class="s.resultValue">
                <AnimatedNumber :value="calc.totalSavings.value" prefix="¥" />
              </p>
            </div>
            <div :class="s.resultCard">
              <p :class="s.resultLabel">{{ t('roi.roiRate') }}</p>
              <p :class="s.resultValue">
                <AnimatedNumber :value="Math.round(calc.roi.value)" suffix="%" />
              </p>
            </div>
            <div :class="s.resultCard">
              <p :class="s.resultLabel">{{ t('roi.payback') }}</p>
              <p :class="s.resultValue">
                <AnimatedNumber :value="Math.round(calc.paybackMonths.value)" suffix="个月" />
              </p>
            </div>
          </div>

          <!-- 柱状图对比 -->
          <div :class="s.chartBox">
            <p :class="s.chartTitle">{{ t('roi.chartTitle') }}</p>
            <RoiBarChart
              :before="calc.annualFee.value"
              :after="calc.annualFee.value + calc.totalSavings.value"
            />
          </div>

          <!-- 明细 -->
          <ul :class="s.breakdown">
            <li>
              <span>{{ t('roi.saveHr') }}</span>
              <strong>¥{{ formatCurrency(calc.hrSavings.value) }}</strong>
            </li>
            <li>
              <span>{{ t('roi.saveRecruit') }}</span>
              <strong>¥{{ formatCurrency(calc.recruitSavings.value) }}</strong>
            </li>
            <li>
              <span>{{ t('roi.saveTurnover') }}</span>
              <strong>¥{{ formatCurrency(calc.turnoverSavings.value) }}</strong>
            </li>
          </ul>

          <!-- CTA -->
          <button :class="s.ctaBtn" @click="modalStore.openModal()">
            {{ t('roi.cta') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { useRoiCalculator } from '@/composables/useRoiCalculator.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import AnimatedNumber from './AnimatedNumber.vue';
import RoiBarChart from './RoiBarChart.vue';
import s from './RoiCalculatorSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { openModal: () => {} });

const calc = useRoiCalculator();

const fields = [
  { key: 'employeeCount',  labelKey: 'roi.empCount',  min: 100,  max: 50000, step: 100,  unit: '人' },
  { key: 'monthlyHires',   labelKey: 'roi.monthHire', min: 5,    max: 500,   step: 5,    unit: '人' },
  { key: 'hireCycleDays',  labelKey: 'roi.hireCycle', min: 7,    max: 90,    step: 1,    unit: '天' },
  { key: 'hrTeamSize',     labelKey: 'roi.hrTeam',    min: 1,    max: 50,    step: 1,    unit: '人' },
  { key: 'hrMonthlySalary',labelKey: 'roi.hrSalary',  min: 5000, max: 30000, step: 500,  unit: '元' },
];

function formatValue(field) {
  const v = calc[field.key].value;
  if (field.unit === '元') return `¥${v.toLocaleString()}`;
  return `${v.toLocaleString()}${field.unit}`;
}

function formatMinMax(v, unit) {
  if (unit === '元') return `¥${v.toLocaleString()}`;
  return `${v.toLocaleString()}${unit}`;
}

function formatCurrency(v) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return v.toLocaleString();
}
</script>
