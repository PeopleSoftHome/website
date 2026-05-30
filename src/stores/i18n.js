/**
 * i18n Store — 多语言状态管理
 * 提供 locale、setLocale、t() 翻译函数
 */
import { ref, watch } from 'vue';
import { interpolate } from '@/i18n/interpolate.js';
import zhCN from '@/i18n/locales/zh-CN.json';
import en from '@/i18n/locales/en.json';
import zhTW from '@/i18n/locales/zh-TW.json';

export const LOCALES = {
  'zh':    { label: '简体中文', json: zhCN },
  'en':    { label: 'English', json: en   },
  'zh-TW': { label: '繁體中文', json: zhTW },
};

const HREFLANG_MAP = {
  'zh':    'zh-CN',
  'en':    'en',
  'zh-TW': 'zh-TW',
};

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

function syncDocumentMeta(locale) {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = HREFLANG_MAP[locale] || locale;

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

export function createI18n() {
  const locale = ref(detectLocale());

  const setLocale = (newLocale) => {
    if (!LOCALES[newLocale]) return;
    locale.value = newLocale;
    localStorage.setItem('tp-locale', newLocale);
  };

  const t = (key, vars = {}) => {
    const dict = LOCALES[locale.value]?.json ?? LOCALES['zh'].json;
    const raw = key.split('.').reduce((obj, k) => obj?.[k], dict);
    if (raw === undefined) {
      if (import.meta?.env?.DEV) console.warn(`[i18n] Missing key: "${key}" (locale: ${locale.value})`);
      return key;
    }
    return interpolate(raw, vars);
  };

  // 语言切换时同步更新 document title / description / hreflang
  watch(locale, (loc) => {
    const dict = LOCALES[loc]?.json ?? LOCALES['zh'].json;
    syncDocumentMeta(loc);
  }, { immediate: true });

  return { locale, setLocale, t, LOCALES };
}
