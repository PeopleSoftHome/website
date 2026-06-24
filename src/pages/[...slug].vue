<template>
  <section :class="$style.notFound">
    <div :class="$style.container">
      <h1 :class="$style.code">404</h1>
      <p :class="$style.title">{{ t('notFound.title') }}</p>
      <p :class="$style.desc">{{ t('notFound.desc') }}</p>
      <NuxtLink to="/" :class="$style.btn">
        {{ t('notFound.backHome') }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ title: 'notFound.title' });


const { t } = useI18n();
</script>

<style module>
.notFound {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
}

.container {
  max-width: 480px;
}

.code {
  font-size: clamp(80px, 12vw, 140px);
  font-weight: 800;
  line-height: 1;
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.desc {
  font-size: 15px;
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 32px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 32px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  color: var(--white);
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s, transform 0.2s;
}

.btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .notFound {
    padding: 60px 16px;
  }
  .title {
    font-size: 20px;
  }
}
</style>
