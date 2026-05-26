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
          <template v-for="link in NAV_LINKS" :key="link.id">
            <div v-if="link.hasDropdown" :class="s.item">
              <span :class="s.itemLabel">
                {{ t(`nav.${link.id === 'ai-family' ? 'aiFamily'
                  : link.id === 'solutions' ? 'solutions'
                  : link.id === 'cases'     ? 'cases'
                  : link.id === 'resources' ? 'resources'
                  : link.id}`) }}
                <span :class="s.arrow"><Icon name="chevron-down" :size="14" /></span>
              </span>
              <NavDropdown :items="link.items" :banner="link.banner" />
            </div>
            <a v-else :href="link.href ?? '#'" :class="s.item">
              {{ t(`nav.${link.id === 'cases' ? 'cases' : 'resources'}`) }}
            </a>
          </template>
        </div>

        <!-- 右侧操作区 -->
        <div :class="s.right">
          <span :class="s.phone">{{ t('nav.phone') }}</span>

          <!-- 搜索栏（内联展开） -->
          <div :class="[s.searchWrap, searchOpen ? s.searchExpanded : '', scrolled ? s.searchScrolled : '']">
            <button
              :class="s.searchIconBtn"
              @click="searchOpen ? closeSearchBar() : openSearchBar()"
              :aria-label="t('search.label')"
            >
              <Icon name="search" :size="16" />
            </button>
            <input
              ref="searchInputRef"
              :class="s.searchInput"
              type="text"
              v-model="searchQuery"
              @keydown="handleSearchKey"
              :placeholder="t('search.placeholder')"
              autocomplete="off"
            />
            <button :class="s.searchClose" @click="closeSearchBar" aria-label="关闭搜索">
              <Icon name="close" :size="14" />
            </button>
          </div>

          <!-- 语言切换器 -->
          <div :class="s.langWrap">
            <button
              :class="s.langBtn"
              @click="langMenuOpen = !langMenuOpen"
              :aria-label="t('nav.langLabel')"
              :aria-expanded="langMenuOpen"
            >
              <Icon name="globe" :size="14" /> {{ LOCALES[locale]?.label ?? t('nav.langLabel') }} <Icon name="chevron-down" :size="12" />
            </button>
            <div v-if="langMenuOpen" :class="s.langMenu" role="menu">
              <button
                v-for="[key, { label }] in Object.entries(LOCALES)"
                :key="key"
                role="menuitem"
                :class="[s.langOption, locale === key ? s.langActive : '']"
                @click="pickLang(key)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- 主题切换 -->
          <button
            :class="s.themeBtn"
            @click="themeStore.toggle()"
            :aria-label="isDark ? t('nav.themeLight') : t('nav.themeDark')"
          >
            <Icon :name="isDark ? 'sun' : 'moon'" :size="16" />
          </button>

          <Button variant="ghost" size="sm" :class-name="scrolled ? s.loginScrolled : ''">
            {{ t('nav.login') }}
          </Button>
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

  <MobileMenu :is-open="mobileOpen" @close="closeMobile" />
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useNavScroll } from '@/composables/useNavScroll.js';
import { NAV_LINKS } from '@/data/navigation.js';
import { LOCALES } from '@/stores/i18n.js';
import Icon from '../../ui/Icon/Icon.vue';
import NavDropdown from './NavDropdown.vue';
import MobileMenu from './MobileMenu.vue';
import Button from '../../ui/Button/Button.vue';
import s from './NavBar.module.css';

const { scrolled } = useNavScroll();

const i18nStore   = inject('i18n', { t: (k) => k, locale: 'zh', setLocale: () => {} });
const themeStore  = inject('theme', { theme: ref('light'), toggle: () => {} });
const searchStore = inject('search', { openSearch: () => {} });
const modalStore  = inject('modal', { openModal: () => {} });

const { t, locale, setLocale } = i18nStore;

const mobileOpen = ref(false);
const langMenuOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref(null);

const openMobile = () => { mobileOpen.value = true; };
const closeMobile = () => { mobileOpen.value = false; };
const pickLang = (l) => { setLocale(l); langMenuOpen.value = false; };

const openSearchBar = () => {
  searchOpen.value = true;
  setTimeout(() => searchInputRef.value?.focus(), 50);
};

const closeSearchBar = () => {
  searchOpen.value = false;
  searchQuery.value = '';
};

const handleSearchKey = (e) => {
  if (e.key === 'Enter' && searchQuery.value.trim()) {
    searchStore.openSearch();
    closeSearchBar();
  }
  if (e.key === 'Escape') closeSearchBar();
};

const isDark = computed(() => themeStore.theme?.value === 'dark');
</script>
