import { useScrollReveal } from '../../../hooks/useScrollReveal';

/**
 * RevealWrapper — 滚动入场动画包装器
 * 自动为 children 注入 reveal + is-visible 动画
 *
 * @param {0|1|2|3|4|5} delay - stagger 延迟级别（对应 reveal-delay-N）
 * @param {string} as         - 渲染的 HTML 标签（默认 div）
 */
export default function RevealWrapper({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const { ref } = useScrollReveal();

  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';
  const cls = ['reveal', delayClass, className].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={cls}>
      {children}
    </Tag>
  );
}
