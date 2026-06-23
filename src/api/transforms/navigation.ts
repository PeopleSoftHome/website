interface NavChild {
  icon?: string;
  label?: string;
  description?: string;
  href?: string;
}

interface NavItem {
  id?: string;
  label?: string;
  href?: string;
  children?: NavChild[];
}

interface Navigation {
  items?: NavItem[];
}

export function transformNavigation(apiNav: unknown) {
  if (!apiNav || !(apiNav as Navigation).items) return [];
  return ((apiNav as Navigation).items || []).map((item) => ({
    id: item.label?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || item.id,
    label: item.label,
    href: item.href || '#',
    hasDropdown: !!(item.children && item.children.length),
    items: (item.children || []).map((c) => ({
      icon: c.icon || 'link',
      title: c.label,
      desc: c.description || '',
      href: c.href || '#',
    })),
    banner: null, // 后端暂无 banner 数据
  }));
}
