<template>
  <template v-if="auth.isLoggedIn">
    <NotificationBell />
    <div :class="s.userWrap">
      <button :class="s.userBtn" @click="userMenuOpen = !userMenuOpen">
        <span :class="s.userAvatar">{{ userInitial }}</span>
        <span :class="s.userName">{{ user?.name || user?.email }}</span>
        <Icon name="chevron-down" :size="12" />
      </button>
      <div v-if="userMenuOpen" :class="s.userMenu" role="menu">
        <button role="menuitem" :class="s.userMenuItem" @click="goProfile">
          <Icon name="user" :size="14" /> {{ t('nav.profile') }}
        </button>
        <button role="menuitem" :class="s.userMenuItem" @click="handleLogout">
          <Icon name="logout" :size="14" /> {{ t('nav.logout') }}
        </button>
      </div>
    </div>
  </template>
  <template v-else>
    <Button variant="ghost" size="sm" :class-name="scrolled ? s.loginScrolled : ''" @click="openAuth">
      {{ t('nav.login') }}
    </Button>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from '@/stores/auth.pinia';
import Icon from '../../ui/Icon/Icon.vue';
import Button from '../../ui/Button/Button.vue';
import s from './NavBar.module.css';

const NotificationBell = defineAsyncComponent(() => import('@/components/ui/NotificationBell/NotificationBell.vue'));

interface UserInfo {
  name?: string;
  email?: string;
}

defineProps<{ scrolled: boolean }>();

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();
const authOpen = useState('authOpen', () => false);

const userMenuOpen = ref(false);

const user = computed(() => auth.user as UserInfo | null | undefined);
const userInitial = computed(() => {
  const name = user.value?.name || user.value?.email || '';
  return name.charAt(0).toUpperCase();
});

const openAuth = () => { authOpen.value = true; };
const goProfile = () => { userMenuOpen.value = false; router.push('/profile'); };
const handleLogout = () => { auth.logout(); userMenuOpen.value = false; };
</script>
