<template>
  <div>
    <main :class="s.page">
      <div class="container">
        <div :class="s.card" class="reveal">
          <div :class="[s.icon, s.iconCancel]">✕</div>
          <h1 :class="s.title">{{ t('marketplace.paymentCancelled') }}</h1>
          <p :class="s.desc">{{ t('marketplace.paymentCancelledDesc') }}</p>
          <div :class="s.actions">
            <NuxtLink :to="`/marketplace/${route.query.return_slug || ''}`" :class="s.btnPrimary">
              {{ t('marketplace.tryAgain') }}
            </NuxtLink>
            <NuxtLink to="/marketplace" :class="s.btnSecondary">
              {{ t('marketplace.backToMarketplace') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import s from './cancel.module.css';

definePageMeta({ title: 'marketplace.paymentCancelled', description: 'marketplace.subtitle' });

const { t } = useI18n();
const route = useRoute();
</script>
