<template>
  <section :class="s.section" id="ai">
    <div :class="s.dots" aria-hidden="true" />
    <div class="container">
      <RevealWrapper :class-name="s.header">
        <span :class="s.tag">{{ t('aiFamily.sectionTag') }}</span>
        <h2 :class="s.title">{{ t('aiFamily.sectionTitle') }}</h2>
        <p :class="s.subtitle">{{ t('aiFamily.sectionSub') }}</p>
      </RevealWrapper>

      <div :class="s.grid">
        <AiCard
          v-for="(card, i) in displayCards"
          :key="card.id"
          :icon="card.icon"
          :name="cardKey(card.id) ? t(`aiFamily.cards.${cardKey(card.id)}.name`) : card.name"
          :tagline="cardKey(card.id) ? t(`aiFamily.cards.${cardKey(card.id)}.tagline`) : card.tagline"
          :link-text="t('aiFamily.linkText')"
          :hot="card.hot"
          :hot-label="t('aiFamily.hotBadge')"
          :delay="i"
        />

        <!-- Banner 卡 -->
        <RevealWrapper :class-name="s.bannerCard">
          <div :class="s.bannerInner">
            <div>
              <div :class="s.bannerLabel">{{ t('aiFamily.banner.label') }}</div>
              <div :class="s.bannerTitle">{{ t('aiFamily.banner.title') }}</div>
              <div :class="s.bannerSub">{{ t('aiFamily.banner.sub') }}</div>
            </div>
            <button :class="s.bannerCta" @click="modalStore.openModal()">
              {{ t('aiFamily.banner.cta') }}
            </button>
          </div>
        </RevealWrapper>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia';
import { AI_CARD_KEY_MAP } from '@/i18n/keyMap';
import { useCmsDataByKey } from '@/composables/useCmsData';
import { transformAiCards } from '@/api/transforms';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import AiCard from './AiCard.vue';
import s from './AiFamilySection.module.css';

interface AiCardItem {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  hot?: boolean;
}

const { t } = useI18n();
const modalStore = useModalStore();

const { displayItems: rawDisplayCards } = useCmsDataByKey('ai-cards', { transform: transformAiCards, fallbackKey: 'ai-cards' });
const displayCards = computed(() => rawDisplayCards.value as unknown as AiCardItem[]);

const cardKey = (id: string) => (AI_CARD_KEY_MAP as Record<string, string>)[id];
</script>
