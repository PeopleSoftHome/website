/**
 * usePageSeo — 统一页面 SEO 元数据
 * 设置 title / description / OG / Twitter / canonical
 */
export function usePageSeo(options: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
}) {
  const { title, description = '', image = 'https://talentpro.cn/og-image.png', path, type = 'website' } = options;
  const route = useRoute();
  const url = path ? `https://talentpro.cn${path}` : `https://talentpro.cn${route.path}`;

  useHead(() => ({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: 'TalentPro' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
  }));
}
