<template>
  <Transition name="cookie">
    <div v-if="showBanner" :class="s.banner">
      <div :class="s.inner">
        <CookieCompact
          v-if="!showPreferences"
          @accept="$emit('accept-all')"
          @reject="$emit('reject-all')"
          @open-preferences="$emit('open-preferences')"
        />
        <CookiePreferences
          v-else
          @reject="$emit('reject-all')"
          @save="$emit('save-prefs', $event)"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import s from './CookieBanner.module.css';
import CookieCompact from './CookieCompact.vue';
import CookiePreferences from './CookiePreferences.vue';

defineProps({
  showBanner: { type: Boolean, required: true },
  showPreferences: { type: Boolean, required: true },
});

defineEmits(['accept-all', 'reject-all', 'save-prefs', 'open-preferences']);
</script>
