import { createLocalizedData } from '../../utils/localizedData';
import { CASE_MENGNIU, CASE_MENGNIU_EN } from './items/mengniu';
import { CASE_HAIER, CASE_HAIER_EN } from './items/haier';
import { CASE_SUNING, CASE_SUNING_EN } from './items/suning';
import { CASE_PICC, CASE_PICC_EN } from './items/picc';
import { CASE_STATEGRID, CASE_STATEGRID_EN } from './items/stategrid';
import { CASE_BYTEDANCE, CASE_BYTEDANCE_EN } from './items/bytedance';
import { CASE_XINYADA, CASE_XINYADA_EN } from './items/xinyada';
import { CASE_BOE, CASE_BOE_EN } from './items/boe';

const casesData = createLocalizedData({
  zh: [
    CASE_MENGNIU,
    CASE_HAIER,
    CASE_SUNING,
    CASE_PICC,
    CASE_STATEGRID,
    CASE_BYTEDANCE,
    CASE_XINYADA,
    CASE_BOE,
  ],
  en: [
    CASE_MENGNIU_EN,
    CASE_HAIER_EN,
    CASE_SUNING_EN,
    CASE_PICC_EN,
    CASE_STATEGRID_EN,
    CASE_BYTEDANCE_EN,
    CASE_XINYADA_EN,
    CASE_BOE_EN,
  ],
});

export const getCases = casesData.getItems;

/** 兼容旧直接引用：默认中文 */
export const CASES = casesData.defaultItems;

export { CASE_INDUSTRIES, CASE_INDUSTRIES_EN, getCaseIndustries } from './industries';
