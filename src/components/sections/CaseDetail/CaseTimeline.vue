<template>
  <div :class="s.timeline" class="reveal">
    <div v-for="(item, idx) in items" :key="idx" :class="s.timelineItem">
      <div :class="s.timelineLeft">
        <div :class="s.timelineNode">
          <span :class="s.timelineNum">0{{ idx + 1 }}</span>
        </div>
        <span :class="s.timelinePhase">{{ item.phase }}</span>
        <div v-if="idx < items.length - 1" :class="s.timelineLine" />
      </div>
      <div :class="s.timelineCard">
        <h3 v-if="item.title" :class="s.timelineTitle">{{ item.title }}</h3>
        <p :class="s.timelineDesc">{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import s from './CaseTimeline.module.css';

interface TimelineItem {
  phase: string;
  title?: string;
  desc: string;
}

const props = defineProps({ caseStudy: { type: Object, default: null } });
const { t } = useI18n();

const items = computed<TimelineItem[]>(() => {
  const c = props.caseStudy;
  if (!c) return [];
  if (c.timeline?.length) return c.timeline as TimelineItem[];
  return [
    { phase: t('cases.challenge'), title: t('cases.challenge'), desc: c.challenge },
    { phase: t('cases.solution'), title: t('cases.solution'), desc: c.solution },
    { phase: t('cases.results'), title: t('cases.results'), desc: c.results },
  ];
});
</script>
