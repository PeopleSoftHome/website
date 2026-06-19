<template>
  <div v-if="hasError" :class="s.container">
    <div :class="s.content">
      <div :class="s.icon">⚠️</div>
      <h2 :class="s.title">{{ t('error.title') }}</h2>
      <p :class="s.desc">
        {{ errorMessage || t('error.fallback') }}
      </p>
      <div :class="s.actions">
        <button :class="s.btnPrimary" @click="handleRetry">{{ t('error.retry') }}</button>
        <button :class="s.btnSecondary" @click="handleReset">{{ t('error.backHome') }}</button>
      </div>
      <details v-if="errorInfo && isDev" :class="s.details">
        <summary>{{ t('error.details') }}</summary>
        <pre :class="s.pre">{{ errorInfo }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

import s from './ErrorBoundary.module.css';

const { t } = useI18n();

const router = useRouter();
const hasError = ref(false);
const errorMessage = ref('');
const errorInfo = ref('');
const isDev = import.meta.env.DEV;

onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err?.message || t('error.unknown');
  errorInfo.value = `${err?.stack || ''}\n\n组件: ${instance?.$options?.name || 'unknown'}\n信息: ${info}`;

  // 上报错误（生产环境）
  if (!isDev && window.reportError) {
    window.reportError(err);
  }

  // 阻止错误继续传播
  return false;
});

const handleRetry = () => {
  location.reload();
};

const handleReset = () => {
  hasError.value = false;
  errorMessage.value = '';
  errorInfo.value = '';
  router.push('/');
};
</script>
