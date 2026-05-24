<template>
  <BaseModal
    :is-open="isOpen"
    :aria-label="t('contact.ariaLabel')"
    :overlay-class-name="s.overlay"
    @close="emit('close')"
  >
    <div :class="s.card">
      <button :class="s.close" @click="emit('close')" :aria-label="t('modal.close')">✕</button>
      <div :class="s.header">
        <div :class="s.avatar">💬</div>
        <div>
          <div :class="s.title">{{ t('contact.title') }}</div>
          <div :class="s.subtitle">{{ t('contact.subtitle') }}</div>
        </div>
      </div>
      <div :class="s.divider" />
      <div :class="s.contactItem">
        <span :class="s.contactIcon">📞</span>
        <div>
          <div :class="s.contactLabel">{{ t('contact.phoneLabel') }}</div>
          <a :class="s.contactValue" href="tel:4008888888">400-888-8888</a>
        </div>
      </div>
      <div :class="s.contactItem">
        <span :class="s.contactIcon">🕘</span>
        <div>
          <div :class="s.contactLabel">{{ t('contact.timeLabel') }}</div>
          <div :class="s.contactValue">{{ t('contact.timeValue') }}</div>
        </div>
      </div>
      <div :class="s.qrWrap">
        <div :class="s.qrBox">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="1" y="1" width="78" height="78" rx="6" stroke="var(--gray-200)" stroke-width="1.5"/>
            <rect x="10" y="10" width="22" height="22" rx="2" stroke="var(--primary)" stroke-width="1.5" fill="none"/>
            <rect x="14" y="14" width="14" height="14" rx="1" fill="var(--primary-light)"/>
            <rect x="48" y="10" width="22" height="22" rx="2" stroke="var(--primary)" stroke-width="1.5" fill="none"/>
            <rect x="52" y="14" width="14" height="14" rx="1" fill="var(--primary-light)"/>
            <rect x="10" y="48" width="22" height="22" rx="2" stroke="var(--primary)" stroke-width="1.5" fill="none"/>
            <rect x="14" y="52" width="14" height="14" rx="1" fill="var(--primary-light)"/>
            <circle cx="52" cy="52" r="10" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1"/>
            <text x="52" y="56" text-anchor="middle" font-size="10" font-weight="700" fill="var(--primary)">微</text>
          </svg>
          <div :class="s.qrLabel">{{ t('contact.qrWechat') }}</div>
        </div>
        <div :class="s.qrBox">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="1" y="1" width="78" height="78" rx="6" stroke="var(--gray-200)" stroke-width="1.5"/>
            <rect x="10" y="10" width="22" height="22" rx="2" stroke="var(--ai-purple)" stroke-width="1.5" fill="none"/>
            <rect x="14" y="14" width="14" height="14" rx="1" fill="var(--ai-purple-lighter)"/>
            <rect x="48" y="10" width="22" height="22" rx="2" stroke="var(--ai-purple)" stroke-width="1.5" fill="none"/>
            <rect x="52" y="14" width="14" height="14" rx="1" fill="var(--ai-purple-lighter)"/>
            <rect x="10" y="48" width="22" height="22" rx="2" stroke="var(--ai-purple)" stroke-width="1.5" fill="none"/>
            <rect x="14" y="52" width="14" height="14" rx="1" fill="var(--ai-purple-lighter)"/>
            <circle cx="52" cy="52" r="10" fill="#F3E8FF" stroke="var(--ai-purple)" stroke-width="1"/>
            <text x="52" y="56" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ai-purple)">公</text>
          </svg>
          <div :class="s.qrLabel">{{ t('contact.qrOfficial') }}</div>
        </div>
      </div>
      <button :class="s.cta" @click="emit('close')">{{ t('contact.cta') }}</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { inject } from 'vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import s from './ContactModal.module.css';

const { t } = inject('i18n', { t: (k) => k });

defineProps({
  isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(['close']);
</script>
