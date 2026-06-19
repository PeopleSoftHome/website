/**
 * 轻量级 Toast 通知
 * 替代 alert()，用于 Portal 前端
 */
export function showToast(message, type = 'info', duration = 3000) {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  const colors = {
    info: 'var(--primary)',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  };
  el.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: ${colors[type] || colors.info};
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 90vw;
    word-break: break-word;
  `;
  el.textContent = message;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
