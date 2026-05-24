import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * SearchContext — 全局搜索弹窗开关
 *
 * 独立于 useSearch Hook，SearchContext 只管理"是否打开"。
 * useSearch 负责搜索逻辑，在 SearchModal 内部使用。
 * body scroll lock 由 SearchModal 内嵌的 BaseModal 统一管理。
 *
 * z-index: 2500（介于 DemoModal 2000 和 VideoModal 3000 之间）
 */
export const SearchContext = createContext({
  isOpen:      false,
  openSearch:  () => {},
  closeSearch: () => {},
});

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch  = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  /* ── 全局 Cmd+K / Ctrl+K 监听 ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <SearchContext.Provider value={{ isOpen, openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  return useContext(SearchContext);
}
