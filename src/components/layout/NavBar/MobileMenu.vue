<template>
  <div>
    <!-- 遮罩 -->
    <div
      :class="[s.overlay, isOpen ? s.overlayOpen : '']"
      @click="emit('close')"
      aria-hidden="true"
    />
    <!-- 菜单主体 -->
    <div
      ref="menuRef"
      :class="[s.menu, isOpen ? s.menuOpen : '']"
      role="dialog"
      aria-modal="true"
      aria-label="导航菜单"
    >
      <div :class="s.body">
        <template v-for="link in NAV_LINKS" :key="link.id">
          <a v-if="!link.hasDropdown" :href="link.href" :class="s.directLink" @click="emit('close')">
            {{ link.label }}
          </a>
          <div v-else :class="s.navItem">
            <button
              :class="s.navHeader"
              @click="toggleSubmenu(link.id)"
              :aria-expanded="expandedId === link.id"
            >
              <span>{{ link.label }}</span>
              <span :class="[s.arrow, expandedId === link.id ? s.arrowOpen : '']">▾</span>
            </button>
            <div
              :class="s.submenu"
              :style="{ maxHeight: expandedId === link.id ? '400px' : '0' }"
              :aria-hidden="expandedId !== link.id"
            >
              <a
                v-for="item in link.items"
                :key="item.title"
                :href="item.href"
                :class="s.subItem"
                @click="emit('close')"
              >
                <span :class="s.subIcon">{{ item.icon }}</span>
                <span :class="s.subText">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.desc }}</span>
                </span>
              </a>
            </div>
          </div>
        </template>
      </div>
      <div :class="s.footer">
        <div :class="s.phone">售前咨询 <strong>400-888-8888</strong></div>
        <button :class="s.cta" @click="handleCta">预约演示 →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { NAV_LINKS } from '@/data/navigation.js';
import { useFocusTrap } from '@/composables/useFocusTrap.js';
import s from './MobileMenu.module.css';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(['close']);

const menuRef = ref(null);
const expandedId = ref(null);

const modalStore = inject('modal', { openModal: () => {} });

useFocusTrap(() => props.isOpen, menuRef);

const toggleSubmenu = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const handleCta = () => {
  emit('close');
  modalStore.openModal();
};
</script>
