<template>
  <div :class="[s.nav, s[variant], className]" role="tablist">
    <button
      v-for="(tab, i) in tabs"
      :key="tab.id"
      role="tab"
      :aria-selected="i === activeIndex"
      :class="[s.btn, i === activeIndex ? s.active : '']"
      @click="emit('select', i)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import s from './TabNav.module.css';

defineProps({
  tabs:        { type: Array, default: () => [] },
  activeIndex: { type: Number, default: 0 },
  variant:     { type: String, default: 'segment' },
  className:   { type: String, default: '' },
});
const emit = defineEmits(['select']);
</script>
