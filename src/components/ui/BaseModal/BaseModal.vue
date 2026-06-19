<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        ref="overlayRef"
        :class="overlayClassName"
        @click="onOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useScrollLock } from '@/composables/useScrollLock.js';
import { useFocusTrap } from '@/composables/useFocusTrap.js';

const props = defineProps({
  isOpen:           { type: Boolean, required: true },
  ariaLabel:        { type: String, default: '' },
  overlayClassName: { type: String, default: '' },
});
const emit = defineEmits(['close']);

const overlayRef = ref(null);

useScrollLock(() => props.isOpen);
useFocusTrap(() => props.isOpen, overlayRef);

function onOverlayClick(e) {
  if (e.target === e.currentTarget) emit('close');
}

function onKey(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close');
}

watch(() => props.isOpen, (open) => {
  if (typeof document === 'undefined') return;
  if (open) document.addEventListener('keydown', onKey);
  else document.removeEventListener('keydown', onKey);
}, { immediate: true });

onUnmounted(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onKey);
});
</script>
