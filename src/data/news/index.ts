import { createLocalizedData } from '../../utils/localizedData';
import { NEWS_SERIES_C_FUNDING, NEWS_SERIES_C_FUNDING_EN } from './articles/series-c-funding';
import { NEWS_AI_FAMILY_3_LAUNCH, NEWS_AI_FAMILY_3_LAUNCH_EN } from './articles/ai-family-3-launch';
import { NEWS_HR_DIGITIZATION_TREND_2026, NEWS_HR_DIGITIZATION_TREND_2026_EN } from './articles/hr-digitization-trend-2026';
import { NEWS_ISO27001_CERTIFICATION, NEWS_ISO27001_CERTIFICATION_EN } from './articles/iso27001-certification';
import { NEWS_SMART_PERFORMANCE_MODULE_LAUNCH, NEWS_SMART_PERFORMANCE_MODULE_LAUNCH_EN } from './articles/smart-performance-module-launch';
import { NEWS_HR_AI_ETHICS_WHITEPAPER, NEWS_HR_AI_ETHICS_WHITEPAPER_EN } from './articles/hr-ai-ethics-whitepaper';

const newsData = createLocalizedData({
  zh: [
    NEWS_SERIES_C_FUNDING,
    NEWS_AI_FAMILY_3_LAUNCH,
    NEWS_HR_DIGITIZATION_TREND_2026,
    NEWS_ISO27001_CERTIFICATION,
    NEWS_SMART_PERFORMANCE_MODULE_LAUNCH,
    NEWS_HR_AI_ETHICS_WHITEPAPER,
  ],
  en: [
    NEWS_SERIES_C_FUNDING_EN,
    NEWS_AI_FAMILY_3_LAUNCH_EN,
    NEWS_HR_DIGITIZATION_TREND_2026_EN,
    NEWS_ISO27001_CERTIFICATION_EN,
    NEWS_SMART_PERFORMANCE_MODULE_LAUNCH_EN,
    NEWS_HR_AI_ETHICS_WHITEPAPER_EN,
  ],
});

export const getNewsArticles = newsData.getItems;

/** 兼容旧直接引用：默认中文 */
export const NEWS_FALLBACK = newsData.defaultItems;

export { NEWS_CATEGORIES, NEWS_CATEGORIES_EN, getNewsCategories } from './categories';
