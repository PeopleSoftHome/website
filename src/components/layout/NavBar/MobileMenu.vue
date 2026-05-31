<template>
  <div v-if="isOpen" :class="s.overlay" @click="emit('close')">
    <div :class="s.panel" @click.stop>
      <div :class="s.panelHead">
        <span :class="s.panelTitle">Menu</span>
        <button :class="s.panelClose" @click="emit('close')" :aria-label="t('nav.menuClose')">
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
        <router-link to="/blog" :class="s.directLink" @click="emit('close')">{{ t('nav.blog') }}</router-link>
        <router-link to="/forum" :class="s.directLink" @click="emit('close')">{{ t('nav.forum') }}</router-link>
      </div>
      <div :class="s.panelFoot">
        <template v-if="auth.isLoggedIn.value">
          <div :class="s.userInfo">
            <span :class="s.userAvatar">{{ userInitial }}</span>
            <span>{{ auth.user.value?.name || auth.user.value?.email }}</span>
          </div>
          <router-link to="/profile" :class="s.directLink" @click="emit('close')">{{ t('nav.profile') }}</router-link>
          <button :class="s.directLink" style="background:none;border:none;width:100%;text-align:left" @click="handleLogout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <Button variant="ghost" size="lg" block @click="openAuth(); emit('close')">
            {{ t('nav.login') }}
          </Button>
        </template>
        <Button variant="primary" size="lg" block @click="modalStore.openModal(); emit('close')">
          {{ t('nav.demo') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { NAV_LINKS } from '@/data/navigation.js';
import Icon from '../../ui/Icon/Icon.vue';
import Button from '../../ui/Button/Button.vue';
import s from './MobileMenu.module.css';

const { t } = useI18n();
const modalStore = inject('modal', { openModal: () => {} });
const auth = inject('auth', { isLoggedIn: { value: false }, user: { value: null }, logout: () => {} });
const authModal = inject('authModal', { open: () => {} });

defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'open-auth']);

const expandedId = ref(null);
const toggle = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const userInitial = computed(() => {
  const name = auth.user.value?.name || auth.user.value?.email || '';
  return name.charAt(0).toUpperCase();
});

const openAuth = () => {
  authModal.open();
};

const handleLogout = () => {
  auth.logout();
  emit('close');
};
</script>
