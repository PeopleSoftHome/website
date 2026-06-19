import { ref, computed, onMounted } from 'vue';
import { cmsApi } from '@/api/cms.js';
import { NAV_LINKS, FOOTER_LINKS } from '@/data/navigation.js';

/**
 * 将 CMS Navigation 的 href 映射到前端 i18n key。
 * 保持与静态 NAV_LINKS 的 id 一致，使翻译键与图标能够复用。
 */
const HEADER_HREF_TO_ID = {
  '/products': 'products',
  '/solutions': 'solutions',
  '/cases': 'cases',
  '/resources': 'resources',
  '/about': 'about',
  '/ai-family': 'ai-family',
};

function transformHeaderItem(item) {
  const hasDropdown = Array.isArray(item.children) && item.children.length > 0;
  const href = item.href || '#';
  const id = HEADER_HREF_TO_ID[href] || item.id || item.label;

  return {
    id,
    label: item.label,
    href,
    hasDropdown,
    items: hasDropdown
      ? item.children.map((child) => ({
          id: child.id,
          title: child.label,
          href: child.href || '#',
          desc: child.description || '',
          icon: child.icon || '',
        }))
      : [],
  };
}

function transformFooterNav(nav) {
  if (!nav?.items?.length) return null;
  return nav.items.map((col) => ({
    title: col.label,
    links: (col.children || []).map((link) => ({
      label: link.label,
      href: link.href || '#',
    })),
  }));
}

/**
 * 导航数据 Composable
 * 优先读取后端 CMS Navigation；失败或为空时回退到静态 JS 常量。
 * header/footer 共享一次请求，避免重复调用。
 */
const headerNav = ref(null);
const footerNav = ref(null);
const loaded = ref(false);
let promise = null;

function ensureLoaded() {
  if (!promise && !loaded.value) {
    promise = Promise.all([
      cmsApi.getNavigation('header').catch(() => null),
      cmsApi.getNavigation('footer').catch(() => null),
    ])
      .then(([header, footer]) => {
        headerNav.value = header?.data ?? header ?? null;
        footerNav.value = footer?.data ?? footer ?? null;
      })
      .finally(() => {
        loaded.value = true;
      });
  }
  return promise;
}

export function useNavigation() {
  onMounted(ensureLoaded);

  const navLinks = computed(() => {
    const items = headerNav.value?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map(transformHeaderItem);
    }
    return NAV_LINKS;
  });

  const footerLinks = computed(() => {
    const transformed = transformFooterNav(footerNav.value);
    return transformed && transformed.length > 0 ? transformed : FOOTER_LINKS;
  });

  return {
    navLinks,
    footerLinks,
    loaded,
  };
}
