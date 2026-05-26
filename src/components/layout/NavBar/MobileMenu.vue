<template>
  <div v-if="isOpen" :class="s.overlay" @click="emit('close')">
    <div :class="s.panel" @click.stop>
      <div :class="s.panelHead">
        <span :class="s.panelTitle">Menu</span>
        <button :class="s.panelClose" @click="emit('close')" aria-label="Close menu">
          <Icon name="close" :size="20" />
        </button>
      </div>
      <div :class="s.panelBody">
        <template v-for="link in NAV_LINKS" :key="link.id">
          <a v-if="!link.hasDropdown" :href="link.href" :class="s.directLink" @click="emit('close')">
            {{ link.label }}
          </a>
          <div v-else :class="s.group">
            <button
              :class="[s.groupLabel, expandedId === link.id ? s.groupLabelOpen : '']"
              @click="toggle(link.id)"
            >
              {{ link.label }}
              <span :class="[s.arrow, expandedId === link.id ? s.arrowOpen : '']">
                <Icon name="chevron-down" :size="14" />
              </span>
            </button>
            <div v-if="expandedId === link.id" :class="s.subList">
              <a
                v-for="item in link.items"
                :key="item.title"
                :href="item.href"
                :class="s.subItem"
                @click="emit('close')"
              >
                {{ item.title }}
              </a>
            </div>
          </div>
        </template>
      </div>
      <div :class="s.panelFoot">
        <Button variant="primary" size="lg" block @click="modalStore.openModal(); emit('close')">
          {{ t('nav.demo') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { NAV_LINKS } from '@/data/navigation.js';
import Icon from '../../ui/Icon/Icon.vue';
import Button from '../../ui/Button/Button.vue';
import s from './MobileMenu.module.css';

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { openModal: () => {} });

defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const expandedId = ref(null);
const toggle = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};
</script>
