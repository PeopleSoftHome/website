<template>
  <section :class="s.hero" id="home" :aria-label="displayTitle || t('hero.jsonLdName')">
    <div v-if="backgroundImage" :class="s.bgImageWrap" aria-hidden="true">
      <img :src="backgroundImage" :class="s.bgImage" alt="" />
      <div :class="s.bgImageOverlay" />
    </div>
    <div :class="s.bgGlow" aria-hidden="true" />
    <div :class="s.bgGlowAi" aria-hidden="true" />
    <div :class="[s.deco, s.decoA]" aria-hidden="true" />
    <div :class="[s.deco, s.decoB]" aria-hidden="true" />
    <div :class="[s.deco, s.decoC]" aria-hidden="true" />

    <div class="container">
      <div :class="s.inner">
        <div :class="s.content">
          <div :class="s.tag">
            <span :class="s.tagDot" aria-hidden="true" />
            {{ t('hero.badge') }}
          </div>
          <h1 :class="s.title">
            <template v-if="displayTitle">{{ displayTitle }}</template>
            <template v-else>{{ t('hero.title1') }}<span :class="s.highlight">{{ t('hero.titleAI') }}</span>{{ t('hero.title2') }}<br />{{ t('hero.titleLine2') }}</template>
          </h1>
          <p :class="s.subtitle">{{ displaySubtitle }}</p>
          <div :class="s.ctas">
            <button :class="s.ctaPrimary" @click="modalStore.openModal()">{{ displayCtaPrimary }}</button>
            <button :class="s.ctaGhost" @click="videoModalStore.openVideo()">{{ displayCtaSecondary }}</button>
          </div>
          <div :class="s.trust">
            <span v-for="k in ['trust1','trust2','trust3','trust4']" :key="k" :class="s.trustItem">
              {{ t(`hero.${k}`) }}
            </span>
          </div>
        </div>

        <div :class="s.visual">
          <div class="agent-stage" aria-label="Interactive AI workforce demonstration" aria-live="polite">
            <div class="agent-stage__chrome">
              <div class="agent-stage__eyebrow">AI WORKFORCE AGENT</div>
              <div class="agent-stage__status"><span :class="{ 'agent-stage__status-dot--pending': loading }" /> {{ providerConfigured ? 'Live agent flow' : 'Demo runtime' }}</div>
            </div>

            <div class="agent-stage__question">
              <span class="agent-stage__label">Business question</span>
              <strong>{{ prompts[activePrompt].question }}</strong>
              <button class="agent-stage__next" type="button" :disabled="loading" @click="advancePrompt">Try another →</button>
            </div>

            <div class="agent-stage__flow">
              <div
                v-for="(step, index) in flowSteps"
                :key="step.label"
                class="agent-step"
                :class="{ 'agent-step--active': index <= activeStep }"
              >
                <span class="agent-step__index">0{{ index + 1 }}</span>
                <div>
                  <span class="agent-step__label">{{ step.label }}</span>
                  <strong>{{ step.value }}</strong>
                </div>
              </div>
            </div>

            <div class="agent-stage__insight">
              <span class="agent-stage__insight-label">Recommended action</span>
              <strong>{{ agentState?.analysis.action || 'Agent is analyzing the workspace-scoped signals…' }}</strong>
              <button type="button" class="agent-stage__action" :disabled="loading || !agentState" @click="runAction">
                {{ actionApplied ? 'Action queued ✓' : loading ? 'Analyzing…' : 'Apply action' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import { useVideoModalStore } from '@/stores/videoModal.pinia';
import { apiClient } from '@/shared/api/client';
import s from './HeroSection.module.css';

interface Props {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  showDashboard?: boolean;
}

interface AgentResponse {
  providerConfigured: boolean;
  analysis: {
    finding: string;
    decision: string;
    action: string;
    response: string;
  };
  tool: {
    result: { metrics: string[] };
  };
  action: { status: string } | null;
}

const props = withDefaults(defineProps<Props>(), { showDashboard: true });
const { t } = useI18n();
const modalStore = useModalStore();
const videoModalStore = useVideoModalStore();
const displayTitle = computed(() => props.title?.trim() || '');
const displaySubtitle = computed(() => props.subtitle || t('hero.subtitle'));
const displayCtaPrimary = computed(() => props.ctaPrimary || t('hero.cta1'));
const displayCtaSecondary = computed(() => props.ctaSecondary || t('hero.cta2'));

const prompts = [
  { id: 'hiring-efficiency', question: 'Why did hiring efficiency drop this quarter?' },
  { id: 'attrition-risk', question: 'Which teams are most at risk of regrettable attrition?' },
  { id: 'workforce-cost', question: 'Where can we reduce workforce cost without slowing growth?' },
];

const activePrompt = ref(0);
const activeStep = ref(0);
const actionApplied = ref(false);
const loading = ref(false);
const providerConfigured = ref(false);
const agentState = ref<AgentResponse | null>(null);
const errorMessage = ref('');

const flowSteps = computed(() => {
  const state = agentState.value;
  if (!state) {
    return [
      { label: 'Analyze', value: 'Workspace signals' },
      { label: 'Identify', value: 'Waiting for agent' },
      { label: 'Decide', value: 'Waiting for agent' },
    ];
  }
  const metrics = state.tool.result.metrics;
  return [
    { label: 'Analyze', value: metrics[0] || 'Workspace metrics' },
    { label: 'Identify', value: state.analysis.finding },
    { label: 'Decide', value: state.analysis.decision },
  ];
});

async function runAgent(apply = false) {
  loading.value = true;
  errorMessage.value = '';
  if (!apply) {
    activeStep.value = 0;
    actionApplied.value = false;
  }

  try {
    const response = await apiClient.post<AgentResponse>('/ai/agent/demo', {
      promptId: prompts[activePrompt.value].id,
      apply,
      locale: 'en',
    });
    agentState.value = response.data;
    providerConfigured.value = response.data.providerConfigured;
    activeStep.value = 2;
    actionApplied.value = Boolean(response.data.action);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Agent runtime unavailable';
  } finally {
    loading.value = false;
  }
}

function advancePrompt() {
  if (loading.value) return;
  activePrompt.value = (activePrompt.value + 1) % prompts.length;
  void runAgent();
}

function runAction() {
  if (!agentState.value || loading.value) return;
  void runAgent(true);
}

onMounted(() => {
  void runAgent();
});
</script>

<style scoped>
.agent-stage {
  position: relative;
  width: min(100%, 620px);
  padding: 28px;
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: 28px;
  background: var(--ds-surface-elevated);
  box-shadow: 0 32px 90px var(--ds-shadow-brand);
  overflow: hidden;
}
.agent-stage::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 0%, var(--ds-brand-soft), transparent 48%); pointer-events: none; }
.agent-stage__chrome,
.agent-stage__question,
.agent-stage__flow,
.agent-stage__insight { position: relative; z-index: 1; }
.agent-stage__chrome,
.agent-stage__status { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.agent-stage__eyebrow,
.agent-stage__label,
.agent-stage__insight-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ds-color-text-muted); }
.agent-stage__status { justify-content: flex-end; font-size: 12px; color: var(--ds-color-text-secondary); }
.agent-stage__status span { width: 7px; height: 7px; border-radius: 50%; background: var(--ds-color-state-success); box-shadow: 0 0 0 5px var(--ds-success-soft); }
.agent-stage__status-dot--pending { background: var(--ds-color-text-muted) !important; box-shadow: none !important; }
.agent-stage__question { display: grid; gap: 8px; margin: 36px 0 28px; }
.agent-stage__question strong { font-size: clamp(24px, 3vw, 38px); line-height: 1.08; letter-spacing: -0.04em; color: var(--ds-color-text-primary); }
.agent-stage__next,
.agent-stage__action { width: fit-content; border: 0; background: transparent; padding: 0; color: var(--ds-color-brand-primary); font: inherit; font-size: 13px; cursor: pointer; }
.agent-stage__next:disabled,
.agent-stage__action:disabled { opacity: 0.45; cursor: not-allowed; }
.agent-stage__flow { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.agent-step { min-height: 118px; padding: 14px; border: 1px solid var(--ds-color-border-subtle); border-radius: 18px; background: var(--ds-surface-primary); opacity: 0.46; transition: transform 260ms var(--ease-out), opacity 260ms var(--ease-out), border-color 260ms var(--ease-out); }
.agent-step--active { opacity: 1; transform: translateY(-3px); border-color: var(--ds-color-brand-soft-border); }
.agent-step__index { display: inline-flex; margin-bottom: 26px; font-size: 11px; color: var(--ds-color-text-muted); }
.agent-step div { display: grid; gap: 6px; }
.agent-step__label { font-size: 12px; color: var(--ds-color-text-muted); }
.agent-step strong { font-size: 15px; line-height: 1.3; color: var(--ds-color-text-primary); }
.agent-stage__insight { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px 20px; margin-top: 18px; padding: 18px; border-radius: 18px; background: var(--ds-surface-secondary); }
.agent-stage__insight strong { font-size: 14px; line-height: 1.45; color: var(--ds-color-text-primary); }
.agent-stage__action { grid-column: 2; grid-row: 1 / span 2; padding: 10px 14px; border-radius: 999px; background: var(--ds-color-brand-primary); color: #fff; }
.agent-stage__error { position: relative; z-index: 2; margin-top: 10px; font-size: 12px; color: var(--ds-color-state-danger); }
@media (max-width: 900px) { .agent-stage { padding: 20px; border-radius: 22px; } .agent-stage__flow { grid-template-columns: 1fr; } .agent-step { min-height: auto; } .agent-step__index { margin-bottom: 12px; } }
@media (prefers-reduced-motion: reduce) { .agent-step { transition: none; } }
</style>
