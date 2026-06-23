/**
 * 将后端/静态 coverImage 字段转为可安全作为 backgroundImage 的样式。
 * - 真实图片 URL -> background-image: url(...)
 * - CSS 渐变字符串 -> background-image: <gradient>
 */
export function coverStyle(coverImage?: string | null): { backgroundImage?: string } {
  if (!coverImage) return {};
  const isGradient = /^(linear|radial|conic)-gradient\(/i.test(coverImage);
  return {
    backgroundImage: isGradient ? coverImage : `url(${coverImage})`,
  };
}
