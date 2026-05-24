import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { interpolate } from './interpolate';
import zhCN from './locales/zh-CN.json';
import en   from './locales/en.json';
import zhTW from './locales/zh-TW.json';

/** 支持的语言 */
export const LOCALES = {
  'zh':    { label: '简体中文', json: zhCN },
  'en':    { label: 'English', json: en   },
  'zh-TW': { label: '繁體中文', json: zhTW },
};

/** hreflang 映射 */
const HREFLANG_MAP = {
  'zh':    'zh-CN',
  'en':    'en',
  'zh-TW': 'zh-TW',
};

/** 默认语言：优先读 localStorage，其次浏览器语言，最后兜底简中 */
function detectLocale() {
  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('tp-locale')
    : null;
  if (stored && LOCALES[stored]) return stored;

  const browserLang = typeof navigator !== 'undefined'
    ? navigator.language
    : 'zh';

  if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) return 'zh-TW';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';
  return 'zh';
}

/** 同步 document 元信息（title / description / hreflang） */
function syncDocumentMeta(locale, dict) {
  if (typeof document === 'undefined') return;

  // title
  const title = dict.pageTitle;
  if (title) document.title = title;

  // meta description
  const desc = dict.pageDesc;
  if (desc) {
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
  }

  // html lang
  document.documentElement.lang = HREFLANG_MAP[locale] || locale;

  // hreflang links
  Object.keys(LOCALES).forEach((loc) => {
    const linkId = `hreflang-${loc}`;
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'alternate';
      link.hreflang = HREFLANG_MAP[loc] || loc;
      document.head.appendChild(link);
    }
    const suffix = loc === 'zh' ? '' : `${loc}/`;
    link.href = `https://talentpro.cn/${suffix}`;
  });

  // x-default
  let xDefault = document.getElementById('hreflang-x-default');
  if (!xDefault) {
    xDefault = document.createElement('link');
    xDefault.id = 'hreflang-x-default';
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    document.head.appendChild(xDefault);
  }
  xDefault.href = 'https://talentpro.cn/';
}

/** Context 默认值（防止 Provider 缺失时报错）*/
const I18nContext = createContext({
  locale:    'zh',
  setLocale: () => {},
  t:         (key) => key,
});

/**
 * I18nProvider — 多语言 Context 提供者
 * 挂载在 App.jsx 根节点
 */
export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale);

  const setLocale = useCallback((newLocale) => {
    if (!LOCALES[newLocale]) return;
    setLocaleState(newLocale);
    localStorage.setItem('tp-locale', newLocale);
  }, []);

  /**
   * t(key, vars?) — 翻译函数
   * @param {string} key    - 点分隔键路径，如 'nav.demo'
   * @param {object} vars   - 插值变量，如 { n: 45 }
   * @returns {string}
   */
  const t = useCallback((key, vars = {}) => {
    const dict = LOCALES[locale]?.json ?? LOCALES['zh'].json;
    const raw  = key.split('.').reduce((obj, k) => obj?.[k], dict);
    if (raw === undefined) {
      if (import.meta?.env?.DEV) console.warn(`[i18n] Missing key: "${key}" (locale: ${locale})`);
      return key;
    }
    return interpolate(raw, vars);
  }, [locale]);

  // 语言切换时同步更新 document title / description / hreflang
  useEffect(() => {
    const dict = LOCALES[locale]?.json ?? LOCALES['zh'].json;
    syncDocumentMeta(locale, dict);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** useI18n — 任意组件中调用 */
export function useI18n() {
  return useContext(I18nContext);
}
