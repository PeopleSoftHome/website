/**
 * interpolate — 简单字符串插值
 * 将 {varName} 替换为对应值
 *
 * @example
 *   interpolate('倒计时 {n}s', { n: 45 })  → '倒计时 45s'
 *   interpolate('你好，{name}！', { name: 'HR' }) → '你好，HR！'
 */
export function interpolate(template, vars = {}) {
  if (!vars || Object.keys(vars).length === 0) return template;
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    template
  );
}
