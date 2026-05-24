import { useEffect, useState, lazy, Suspense } from 'react';
import { ModalContext }          from './context/ModalContext';
import { VideoModalContext }     from './context/VideoModalContext';
import { ThemeContext }          from './context/ThemeContext';
import { SearchProvider }        from './context/SearchContext';
import { I18nProvider }          from './i18n/index';
import { useModal }              from './hooks/useModal';
import { useVideoModal }         from './hooks/useVideoModal';
import { useTheme }              from './hooks/useTheme';
import ErrorBoundary             from './components/ui/ErrorBoundary/ErrorBoundary';
import NavBar                    from './components/layout/NavBar/NavBar';
import Footer                    from './components/layout/Footer/Footer';
import FloatingBar               from './components/sections/FloatingBar/FloatingBar';
import HomePage                  from './pages/HomePage';

/* ── 弹窗组件懒加载（非首屏，降低初始 bundle）── */
const DemoModal    = lazy(() => import('./components/ui/DemoModal/DemoModal'));
const VideoModal   = lazy(() => import('./components/ui/VideoModal/VideoModal'));
const SearchModal  = lazy(() => import('./components/ui/SearchModal/SearchModal'));
const ContactModal = lazy(() => import('./components/ui/ContactModal/ContactModal'));
const ChatBot      = lazy(() => import('./components/ui/ChatBot/ChatBot'));

/**
 * App — 根组件 v2.3.3 Phase 3
 *
 * Provider 层级（由外到内）：
 *   I18nProvider         → 多语言（zh / en / zh-TW）
 *   ThemeContext          → 亮色 / 暗色主题
 *   SearchProvider        → 全局搜索（Cmd+K，z-index 2500）
 *   ModalContext          → DemoModal（z-index 2000）
 *   VideoModalContext     → VideoModal（z-index 3000）
 */
export default function App() {
  const modal      = useModal();
  const videoModal = useVideoModal();
  const themeCtx   = useTheme();
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen,    setChatOpen]    = useState(false);

  /* ── 全局 scroll reveal 观察者 ──
   * 扫描所有 .reveal 元素，进入视口后添加 is-visible。
   * MutationObserver 监听 DOM 变化（Tab 切换重渲染新卡片）。
   */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 }
    );

    const scan = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        io.observe(el);
      });
    };

    scan();

    let scanTimer;
    const mo = new MutationObserver(() => {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(scan, 150);
    });
    /* 只观察 <main> 内部变化（懒加载 Section / Tab 切换），
       避免监听全 body 导致每次 React render 都触发扫描 */
    const mainEl = document.querySelector('main');
    if (mainEl) mo.observe(mainEl, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(scanTimer);
    };
  }, []);

  return (
    <I18nProvider>
      <ThemeContext.Provider value={themeCtx}>
        <SearchProvider>
          <ModalContext.Provider value={modal}>
            <VideoModalContext.Provider value={videoModal}>
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <ErrorBoundary>
                <NavBar />
                <main id="main-content"><HomePage /></main>
                <Footer />
              </ErrorBoundary>

              {/* 💬 在线咨询 → ChatBot  |  📞 电话 → ContactModal */}
              <FloatingBar
                onOpenChat={()    => setChatOpen(true)}
                onOpenContact={() => setContactOpen(true)}
              />

              <Suspense fallback={null}>
                <ErrorBoundary>
                  <DemoModal />
                </ErrorBoundary>
                <ErrorBoundary>
                  <VideoModal />
                </ErrorBoundary>
                <ErrorBoundary>
                  <SearchModal />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ContactModal
                    isOpen={contactOpen}
                    onClose={() => setContactOpen(false)}
                  />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ChatBot
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    onOpenDemo={() => { modal.openModal(); setChatOpen(false); }}
                  />
                </ErrorBoundary>
              </Suspense>
            </VideoModalContext.Provider>
          </ModalContext.Provider>
        </SearchProvider>
      </ThemeContext.Provider>
    </I18nProvider>
  );
}
