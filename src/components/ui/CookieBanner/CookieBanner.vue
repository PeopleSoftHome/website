<template>
  <Transition name="cookie">
    <div v-if="showBanner" :class="$style.banner">
      <div :class="$style.inner">
        <!-- Compact view -->
        <div v-if="!showPreferences" :class="$style.compact">
          <p :class="$style.text">
            {{ t('cookie.banner') }}
            <button
              type="button"
              :class="$style.linkBtn"
              @click="openPreferences"
              :aria-label="t('cookie.learnMore')"
            >
              {{ t('cookie.learnMore') }}
            </button>
          </p>
          <div :class="$style.actions">
            <button
              type="button"
              :class="$style.btnReject"
              @click="rejectAll"
            >
              {{ t('cookie.reject') }}
            </button>
            <button
              type="button"
              :class="$style.btnAccept"
              @click="acceptAll"
            >
              {{ t('cookie.acceptAll') }}
            </button>
          </div>
        </div>

        <!-- Preference center -->
        <div v-else :class="$style.preferences">
          <h3 :class="$style.prefTitle">{{ t('cookie.prefTitle') }}</h3>
          <p :class="$style.prefDesc">{{ t('cookie.prefDesc') }}</p>

          <ul :class="$style.list">
            <!-- Necessary (always on) -->
            <li :class="$style.item">
              <div :class="$style.itemHead">
                <span :class="$style.itemLabel">{{ t('cookie.necessary') }}</span>
                <span :class="$style.badgeAlways">{{ t('cookie.alwaysOn') }}</span>
              </div>
              <p :class="$style.itemDesc">{{ t('cookie.necessaryDesc') }}</p>
            </li>

            <!-- Analytics (toggle) -->
            <li :class="$style.item">
              <div :class="$style.itemHead">
                <span :class="$style.itemLabel">{{ t('cookie.analytics') }}</span>
                <label :class="$style.switch">
                  <input
                    type="checkbox"
                    v-model="prefAnalytics"
                    :aria-label="t('cookie.analytics')"
                  />
                  <span :class="$style.slider" />
                </label>
              </div>
              <p :class="$style.itemDesc">{{ t('cookie.analyticsDesc') }}</p>
            </li>

            <!-- Marketing (toggle) -->
            <li :class="$style.item">
              <div :class="$style.itemHead">
                <span :class="$style.itemLabel">{{ t('cookie.marketing') }}</span>
                <label :class="$style.switch">
                  <input
                    type="checkbox"
                    v-model="prefMarketing"
                    :aria-label="t('cookie.marketing')"
                  />
                  <span :class="$style.slider" />
                </label>
              </div>
              <p :class="$style.itemDesc">{{ t('cookie.marketingDesc') }}</p>
            </li>
          </ul>

          <div :class="$style.prefActions">
            <button
              type="button"
              :class="$style.btnReject"
              @click="rejectAll"
            >
              {{ t('cookie.rejectAll') }}
            </button>
            <button
              type="button"
              :class="$style.btnSave"
              @click="handleSave"
            >
              {{ t('cookie.savePrefs') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, inject } from 'vue';

const props = defineProps({
  showBanner:   { type: Boolean, required: true },
  showPreferences:{ type: Boolean, required: true },
});

const emit = defineEmits(['accept-all', 'reject-all', 'save-prefs', 'open-preferences']);

const i18n = inject('i18n');
const t = (key) => i18n?.t(key) ?? key;

const prefAnalytics = ref(false);
const prefMarketing = ref(false);

const openPreferences = () => {
  prefAnalytics.value = false;
  prefMarketing.value = false;
  emit('open-preferences');
};

const acceptAll = () => emit('accept-all');
const rejectAll = () => emit('reject-all');

const handleSave = () => {
  emit('save-prefs', {
    analytics: prefAnalytics.value,
    marketing: prefMarketing.value,
  });
};
</script>

<style module>
.banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1800;
  background: var(--glass-bg);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-top: 1px solid var(--card-border);
  padding: 16px 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}

[data-theme="dark"] .banner {
  background: var(--glass-bg-dark);
  border-top-color: var(--border-on-dark-subtle);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 40px);
}

/* ── Compact view ── */
.compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.text {
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.6;
  flex: 1 1 280px;
}

[data-theme="dark"] .text {
  color: var(--gray-400);
}

.linkBtn {
  color: var(--primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
}

.linkBtn:hover {
  color: var(--primary-dark);
}

.actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btnAccept,
.btnSave {
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s var(--ease-out), opacity 0.15s;
  white-space: nowrap;
}

.btnAccept:hover,
.btnSave:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.btnAccept {
  background: var(--primary);
  color: #fff;
}

.btnSave {
  background: var(--primary);
  color: #fff;
}

.btnReject {
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.btnReject:hover {
  background: var(--gray-200);
}

[data-theme="dark"] .btnReject {
  background: var(--ink-800);
  color: var(--gray-400);
  border-color: var(--ink-700);
}

[data-theme="dark"] .btnReject:hover {
  background: var(--ink-700);
}

/* ── Preference center ── */
.preferences {
  max-width: 640px;
}

.prefTitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 4px;
}

[data-theme="dark"] .prefTitle {
  color: var(--gray-50);
}

.prefDesc {
  font-size: 13px;
  color: var(--gray-600);
  margin-bottom: 16px;
}

[data-theme="dark"] .prefDesc {
  color: var(--gray-500);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.item {
  padding: 14px 16px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
}

[data-theme="dark"] .item {
  border-color: var(--border-on-dark-subtle);
  background: var(--surface-on-dark-subtle);
}

.itemHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.itemLabel {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
}

[data-theme="dark"] .itemLabel {
  color: var(--gray-50);
}

.itemDesc {
  font-size: 13px;
  color: var(--gray-600);
  line-height: 1.5;
}

[data-theme="dark"] .itemDesc {
  color: var(--gray-500);
}

.badgeAlways {
  font-size: 11px;
  font-weight: 600;
  color: var(--success);
  background: rgba(5, 150, 105, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

[data-theme="dark"] .badgeAlways {
  background: rgba(16, 185, 129, 0.15);
}

/* Toggle switch */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--gray-300);
  border-radius: 999px;
  transition: background 0.25s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s var(--ease-spring);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.switch input:checked + .slider {
  background: var(--primary);
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}

.switch input:focus-visible + .slider {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.prefActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ── Transitions ── */
.cookie-enter-active,
.cookie-leave-active {
  transition: transform 0.35s var(--ease-out), opacity 0.3s;
}

.cookie-enter-from,
.cookie-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .compact {
    flex-direction: column;
    align-items: flex-start;
  }
  .actions {
    width: 100%;
  }
  .btnAccept,
  .btnSave,
  .btnReject {
    flex: 1;
    text-align: center;
  }
  .prefActions {
    justify-content: stretch;
  }
  .prefActions .btnReject,
  .prefActions .btnSave {
    flex: 1;
  }
}
</style>
