const GRAD_PRESETS = [
  'linear-gradient(135deg, #1B5FEB, #7C3AED)',
  'linear-gradient(135deg, #059669, #1B5FEB)',
  'linear-gradient(135deg, #D97706, #EF4444)',
  'linear-gradient(135deg, #7C3AED, #EC4899)',
  'linear-gradient(135deg, #0284C7, #1B5FEB)',
];

interface Testimonial {
  id: string;
  industry?: string;
  product?: string;
  text?: string;
  name?: string;
  title?: string;
  avatar?: string | null;
}

export function transformTestimonials(apiTestimonials: unknown[]) {
  if (!Array.isArray(apiTestimonials)) return [];
  return (apiTestimonials as Testimonial[]).map((t, i) => ({
    id: t.id,
    industry: t.industry,
    product: t.product,
    text: t.text,
    name: t.name,
    title: t.title,
    avatar: t.avatar || null,
    avatarGrad: GRAD_PRESETS[i % GRAD_PRESETS.length],
    avatarChar: t.name?.charAt(0) || '?',
  }));
}
