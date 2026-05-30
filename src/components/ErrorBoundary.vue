<template>
  <div v-if="hasError" :class="s.container">
    <div :class="s.content">
      <div :class="s.icon">⚠️</div>
      <h2 :class="s.title">页面出了点小问题</h2>
      <p :class="s.desc">
        {{ errorMessage || '组件加载失败，请尝试刷新页面。' }}
      </p>
      <div :class="s.actions">
        <button :class="s.btnPrimary" @click="handleRetry">重新加载</button>
        <button :class="s.btnSecondary" @click="handleReset">返回首页</button>
      </div>
      <details v-if="errorInfo && isDev" :class="s.details">
        <summary>错误详情（开发模式）</summary>
        <pre :class="s.pre">{{ errorInfo }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';
import s from './ErrorBoundary.module.css';

const router = useRouter();
const hasError = ref(false);
const errorMessage = ref('');
const errorInfo = ref('');
const isDev = import.meta.env.DEV;

onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err?.message || '未知错误';
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
