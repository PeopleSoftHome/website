<template>
  <nav
    :class="[s.nav, scrolled ? s.scrolled : '', isDark ? s.dark : '']"
    role="navigation"
    :aria-label="t('nav.aiFamily')"
  >
    <div class="container">
      <div :class="s.inner">
        <!-- Logo -->
        <a href="#home" :class="s.logo" aria-label="TalentPro">TalentPro</a>

        <!-- 桌面导航链接 -->
        <div :class="s.links">
          <template v-for="link in navLinks" :key="link.id">
            <div v-if="link.hasDropdown" :class="s.item">
              <span :class="s.itemLabel">
                {{ t(`nav.${link.id === 'ai-family' ? 'aiFamily'
                  : link.id === 'solutions' ? 'solutions'
                  : link.id === 'cases'     ? 'cases'
                  : link.id === 'resources' ? 'resources'
                  : link.id === 'about'     ? 'about'
                  : link.id}`) }}
                <span :class="s.arrow"><Icon name="chevron-down" :size="14" /></span>
              </span>
              <NavDropdown :items="link.items" :banner="link.banner" />
            </div>
            <router-link v-else :to="link.href || ''" :class="s.item">
              {{ t(`nav.${link.id === 'ai-family' ? 'aiFamily'
                : link.id === 'about' ? 'about'
                : link.id}`) }}
            </router-link>
          </template>
        </div>

        <!-- 右侧操作区 -->
        <div :class="s.right">
          <span :class="s.phone">{{ sitePhone || t('nav.phone') }}</span>

          <NavSearchBar :scrolled="scrolled" />
          <NavLangSwitcher />

          <!-- 购物车 -->
          <CartButton />

          <!-- 主题切换 -->
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

        <!-- Hamburger（移动端） -->
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
import { useSiteConfig } from '@/shared/composables/useSiteConfig';
import { useThemeStore } from '@/stores/theme.pinia';
import { useModalStore } from '@/stores/modal.pinia';
import Icon from '../../ui/Icon/Icon.vue';
import NavDropdown from './NavDropdown.vue';
import NavSearchBar from './NavSearchBar.vue';
import NavLangSwitcher from './NavLangSwitcher.vue';
import NavUserMenu from './NavUserMenu.vue';
import MobileMenu from './MobileMenu.vue';
import Button from '../../ui/Button/Button.vue';
import s from './NavBar.module.css';

const { scrolled } = useNavScroll();
const { navLinks } = useNavigation() as unknown as { navLinks: NavLinkItem[] };
const { sitePhone } = useSiteConfig();

const { t } = useI18n();
const themeStore  = useThemeStore();
const modalStore  = useModalStore();
const authOpen    = useState('authOpen', () => false);

const mobileOpen = ref(false);

const openMobile = () => { mobileOpen.value = true; };
const closeMobile = () => { mobileOpen.value = false; };

const isDark = computed(() => themeStore.isDark);
</script>
