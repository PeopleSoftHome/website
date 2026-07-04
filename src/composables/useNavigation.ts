import { ref, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import { cmsApi } from '@/api/cms';
import { getHeaderNav, getFooterNav } from '@/data/navigation';

/**
 * 将 CMS Navigation 的 href 映射到前端 i18n key。
 * 保持与静态 NAV_LINKS 的 id 一致，使翻译键与图标能够复用。
 */
const HEADER_HREF_TO_ID: Record<string, string> = {
  '/products': 'products',
  '/solutions': 'solutions',
  '/cases': 'cases',
  '/resources': 'resources',
  '/about': 'about',
  '/ai-family': 'ai-family',
  '#products': 'products',
  '#solutions': 'solutions',
  '#cases': 'cases',
  '#resources': 'resources',
  '#about': 'about',
  '#ai-family': 'ai-family',
};

interface CmsNavChild {
  id?: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
}

interface CmsNavItem {
  id?: string;
  label: string;
  href?: string;
  children?: CmsNavChild[];
}

interface CmsNavData {
  items?: CmsNavItem[];
}

interface HeaderNavItem {
  id: string;
  label: string;
  href: string;
  hasDropdown: boolean;
  items: {
    id?: string;
    title: string;
    href: string;
    desc: string;
    icon: string;
  }[];
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

function transformHeaderItem(item: CmsNavItem): HeaderNavItem {
  const children = item.children || [];
  const hasDropdown = children.length > 0;
  const href = item.href || '#';
  const id = HEADER_HREF_TO_ID[href] || item.id || item.label;

  return {
    id,
    label: item.label,
    href,
    hasDropdown,
    items: hasDropdown
      ? children.map((child) => ({
          id: child.id,
          title: child.label,
          href: child.href || '#',
          desc: child.description || '',
          icon: child.icon || '',
        }))
      : [],
  };
}

function transformFooterNav(nav: CmsNavData | null): FooterColumn[] | null {
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
const headerNav: Ref<CmsNavData | null> = ref(null);
const footerNav: Ref<CmsNavData | null> = ref(null);
const loaded = ref(false);
let promise: Promise<void> | null = null;

function ensureLoaded() {
  if (!promise && !loaded.value) {
    promise = Promise.all([
      cmsApi.getNavigation('header').catch(() => null),
      cmsApi.getNavigation('footer').catch(() => null),
    ])
      .then(([header, footer]) => {
        const h = header as { data?: CmsNavData } | CmsNavData | null;
        const f = footer as { data?: CmsNavData } | CmsNavData | null;
        headerNav.value = (((h && 'data' in h) ? h.data : h) ?? null) as CmsNavData | null;
        footerNav.value = (((f && 'data' in f) ? f.data : f) ?? null) as CmsNavData | null;
      })
      .finally(() => {
        loaded.value = true;
      });
  }
  return promise;
}

export function useNavigation() {
  onMounted(ensureLoaded);
  const { locale } = useI18n();

  const navLinks = computed(() => {
    const items = headerNav.value?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map(transformHeaderItem);
    }
    return getHeaderNav(locale.value);
  });

  const footerLinks = computed(() => {
    const transformed = transformFooterNav(footerNav.value);
    return transformed && transformed.length > 0 ? transformed : getFooterNav(locale.value);
  });

  return {
    navLinks,
    footerLinks,
    loaded,
  };
}
