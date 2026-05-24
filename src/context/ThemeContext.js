import { createContext, useContext } from 'react';

/**
 * ThemeContext — 全局主题状态
 * 挂载在 App.jsx，任意组件通过 useThemeContext() 调用 toggle/setTheme
 */
export const ThemeContext = createContext({
  theme:   'light',
  isDark:  false,
  toggle:  () => {},
  setTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}
