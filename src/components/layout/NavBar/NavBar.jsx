import { useState, useCallback, useRef } from 'react';
import { useNavScroll }          from '../../../hooks/useNavScroll';
import { useModalContext }       from '../../../context/ModalContext';
import { useThemeContext }       from '../../../context/ThemeContext';
import { useSearchContext }      from '../../../context/SearchContext';
import { useI18n, LOCALES }     from '../../../i18n/index';
import { NAV_LINKS }             from '../../../data/navigation';
import NavDropdown               from './NavDropdown';
import MobileMenu                from './MobileMenu';
import Button                    from '../../ui/Button/Button';
import styles                    from './NavBar.module.css';

/**
 * NavBar v2.3.0
 * 新增：语言切换器 + 主题切换按钮
 */
export default function NavBar() {
  const { scrolled }            = useNavScroll();
  const { openModal }           = useModalContext();
  const { theme, toggle }       = useThemeContext();
  const { openSearch }          = useSearchContext();
  const { t, locale, setLocale } = useI18n();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const searchInputRef = useRef(null);

  const openMobile   = useCallback(() => setMobileOpen(true),  []);
  const closeMobile  = useCallback(() => setMobileOpen(false), []);
  const toggleLang   = useCallback(() => setLangMenuOpen(v => !v), []);
  const pickLang     = useCallback((l) => { setLocale(l); setLangMenuOpen(false); }, [setLocale]);

  const openSearchBar = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearchBar = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchKey = useCallback((e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      openSearch();           // 有内容时 Enter → 打开完整搜索弹窗
      closeSearchBar();
    }
    if (e.key === 'Escape') closeSearchBar();
  }, [searchQuery, openSearch, closeSearchBar]);

  const isDark = theme === 'dark';

  return (
    <>
      <nav
        className={[styles.nav, scrolled ? styles.scrolled : '', isDark ? styles.dark : ''].join(' ')}
        role="navigation"
        aria-label={t('nav.aiFamily')}
      >
        <div className="container">
          <div className={styles.inner}>

            {/* Logo */}
            <a href="#home" className={styles.logo} aria-label="TalentPro">
              TalentPro
            </a>

            {/* 桌面导航链接 */}
            <div className={styles.links}>
              {NAV_LINKS.map((link) =>
                link.hasDropdown ? (
                  <div key={link.id} className={styles.item}>
                    <span className={styles.itemLabel}>
                      {t(`nav.${link.id === 'ai-family' ? 'aiFamily'
                        : link.id === 'solutions' ? 'solutions'
                        : link.id === 'cases'     ? 'cases'
                        : link.id === 'resources' ? 'resources'
                        : link.id}`)}
                      <span className={styles.arrow}>▾</span>
                    </span>
                    <NavDropdown items={link.items} banner={link.banner} />
                  </div>
                ) : (
                  <a key={link.id} href={link.href ?? '#'} className={styles.item}>
                    {t(`nav.${link.id === 'cases' ? 'cases' : 'resources'}`)}
                  </a>
                )
              )}
            </div>

            {/* 右侧操作区 */}
            <div className={styles.right}>
              <span className={styles.phone}>{t('nav.phone')}</span>

              {/* 🔍 搜索栏（内联展开）*/}
              <div className={[
                styles.searchWrap,
                searchOpen ? styles.searchExpanded : '',
                scrolled   ? styles.scrolled       : '',
              ].filter(Boolean).join(' ')}>
                <button
                  className={styles.searchIconBtn}
                  onClick={searchOpen ? closeSearchBar : openSearchBar}
                  aria-label={t('search.label')}
                >
                  🔍
                </button>
                <input
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKey}
                  placeholder={t('search.placeholder')}
                  autoComplete="off"
                />
                <button
                  className={styles.searchClose}
                  onClick={closeSearchBar}
                  aria-label="关闭搜索"
                >
                  ✕
                </button>
              </div>

              {/* 🌐 语言切换器 */}
              <div className={styles.langWrap}>
                <button
                  className={styles.langBtn}
                  onClick={toggleLang}
                  aria-label={t('nav.langLabel')}
                  aria-expanded={langMenuOpen}
                >
                  🌐 {LOCALES[locale]?.label ?? t('nav.langLabel')} ▾
                </button>
                {langMenuOpen && (
                  <div className={styles.langMenu} role="menu">
                    {Object.entries(LOCALES).map(([key, { label }]) => (
                      <button
                        key={key}
                        role="menuitem"
                        className={[styles.langOption, locale === key ? styles.langActive : ''].join(' ')}
                        onClick={() => pickLang(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ☀️/🌙 主题切换 */}
              <button
                className={styles.themeBtn}
                onClick={toggle}
                aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <Button
                variant="ghost"
                size="sm"
                className={scrolled ? styles.loginScrolled : ''}
              >
                {t('nav.login')}
              </Button>
              <Button variant="primary" size="sm" onClick={openModal}>
                {t('nav.demo')}
              </Button>
            </div>

            {/* Hamburger（移动端）*/}
            <button
              className={[styles.hamburger, mobileOpen ? styles.hamburgerOpen : ''].join(' ')}
              onClick={mobileOpen ? closeMobile : openMobile}
              aria-label={mobileOpen ? t('nav.menuClose') : t('nav.menuOpen')}
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={closeMobile} />
    </>
  );
}
