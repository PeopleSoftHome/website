const RESOURCE_TYPE_META = {
  report:  { typeLabel: '白皮书', icon: 'bar-chart',   imgGrad: 'linear-gradient(135deg, #EBF1FF, #DBEAFE)', cta: '立即获取' },
  case:    { typeLabel: '案例集', icon: 'award',       imgGrad: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', cta: '立即获取' },
  article: { typeLabel: '干货文章', icon: 'target',    imgGrad: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', cta: '查看详情' },
  guide:   { typeLabel: '报告',   icon: 'clipboard-list', imgGrad: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', cta: '立即下载' },
  video:   { typeLabel: '直播视频', icon: 'play-circle', imgGrad: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)', cta: '观看回放' },
} as const;

interface Resource {
  slug?: string;
  id?: string;
  type: keyof typeof RESOURCE_TYPE_META;
  title: string;
  description?: string;
  publishedAt?: string;
  createdAt?: string;
}

export function transformResources(apiResources: unknown[]) {
  if (!Array.isArray(apiResources)) return [];
  return (apiResources as Resource[]).map((r) => {
    const meta = RESOURCE_TYPE_META[r.type] || RESOURCE_TYPE_META.article;
    return {
      id: r.slug || r.id,
      type: r.type,
      typeLabel: meta.typeLabel,
      icon: meta.icon,
      imgGrad: meta.imgGrad,
      title: r.title,
      desc: r.description || '',
      date: r.publishedAt
        ? new Date(r.publishedAt).toISOString().split('T')[0]
        : new Date(r.createdAt as string).toISOString().split('T')[0],
      cta: meta.cta,
    };
  });
}
