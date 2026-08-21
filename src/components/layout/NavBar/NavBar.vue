<template>
  <nav
    :class="[s.nav, scrolled ? s.scrolled : '', isDark ? s.dark : '']"
    role="navigation"
    :aria-label="t('nav.aiFamily')"
  >
    <div class="container">
      <div :class="s.inner">
        <a href="#home" :class="s.logo" aria-label="TalentPro">TalentPro</a>

        <div :class="s.links">
          <template v-for="link in navLinks" :key="link.id">
            <div v-if="link.hasDropdown" :class="s.item">
              <span :class="s.itemLabel">
                {{ link.label }}
                <span :class="s.arrow"><Icon name="chevron-down" :size="14" /></span>
              </span>
              <NavDropdown :items="link.items" :banner="link.banner" />
            </div>
            <router-link v-else :to="link.href || ''" :class="s.item">
              {{ link.label }}
            </router-link>
          </template>
        </div>

        <div :class="s.right">
          <button
            :class="s.themeBtn"
            @click="themeStore.toggle()"
            :aria-label="isDark ? t('nav.themeLight') : t('nav.themeDark')"
          >
            <Icon :name="isDark ? 'sun' : 'moon'" :size="16" />
          </button>
          <NavUserMenu :scrolled="scrolled" />
          <Button variant="primary" size="sm" @click="modalStore.openModal()">
            {{ t('nav.demo') }}
          </Button>
        </div>

        <button
          :class="[s.hamburger, mobileOpen ? s.hamburgerOpen : '']"
          @click="mobileOpen ? closeMobile() : openMobile()"
          :aria-label="mobileOpen ? t('nav.menuClose') : t('nav.menuOpen')"
          :aria-expanded="mobileOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>
  </nav>

  <MobileMenu :is-open="mobileOpen" @close="closeMobile" @open-auth="authOpen = true" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface NavDropdownItem {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface NavLinkItem {
  id: string;
  label: string;
  href?: string;
  hasDropdown: boolean;
  items?: NavDropdownItem[];
  banner?: { thumb: string; title: string; desc: string; href: string };
}

import { useNavScroll } from '@/composables/useNavScroll';
import { useNavigation } from '@/shared/composables/useNavigation';
import { useThemeStore } from '@/stores/theme.pinia';
import { useModalStore } from '@/stores/modal.pinia';
import Icon from '../../ui/Icon/Icon.vue';
import NavDropdown from './NavDropdown.vue';
import NavUserMenu from './NavUserMenu.vue';
import MobileMenu from './MobileMenu.vue';
import Button from '../../ui/Button/Button.vue';
import s from './NavBar.module.css';

const { scrolled } = useNavScroll();
const { navLinks } = useNavigation() as unknown as { navLinks: NavLinkItem[] };
const { t } = useI18n();
const themeStore = useThemeStore();
const modalStore = useModalStore();
const authOpen = useState('authOpen', () => false);
const mobileOpen = ref(false);

const openMobile = () => { mobileOpen.value = true; };
const closeMobile = () => { mobileOpen.value = false; };
const isDark = computed(() => themeStore.isDark);
</script>
