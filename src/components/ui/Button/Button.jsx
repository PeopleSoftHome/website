import styles from './Button.module.css';

/**
 * Button — 全局按钮组件
 * @param {'primary'|'ghost'|'outline'|'white'} variant
 * @param {'md'|'sm'|'lg'} size
 */
export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  onClick,
  className = '',
  type      = 'button',
  disabled  = false,
  ...rest
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
