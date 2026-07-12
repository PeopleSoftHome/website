/**
 * index 模块
 *
 * 位于: i18n/index.ts
 */
import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';

const messages = {
  zh: zhCN,
  en,
  'zh-TW': zhTW,
};

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages,
});

export default i18n;
