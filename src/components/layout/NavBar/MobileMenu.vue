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
        <template v-for="link in navLinks" :key="link.id">
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
        <template v-if="auth.isLoggedIn">
          <div :class="s.userInfo">
            <span :class="s.userAvatar">{{ userInitial }}</span>
            <span>{{ user?.name || user?.email }}</span>
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import { useAuthStore } from '@/stores/auth.pinia.js';
import { useNavigation } from '@/composables/useNavigation.js';
import Icon from '../../ui/Icon/Icon.vue';
import Button from '../../ui/Button/Button.vue';
import s from './MobileMenu.module.css';

interface UserInfo {
  name?: string;
  email?: string;
}

const { t } = useI18n();
const { navLinks } = useNavigation();
const modalStore = useModalStore();
const auth = useAuthStore();
const authOpen = useState('authOpen', () => false);

defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'open-auth']);

const expandedId = ref<string | null>(null);
const toggle = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const user = computed(() => auth.user as UserInfo | null | undefined);
const userInitial = computed(() => {
  const name = user.value?.name || user.value?.email || '';
  return name.charAt(0).toUpperCase();
});

const openAuth = () => {
  authOpen.value = true;
};

const handleLogout = () => {
  auth.logout();
  emit('close');
};
</script>
