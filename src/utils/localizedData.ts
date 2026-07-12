/**
 * 多语言静态数据工厂
 *
 * 用于统一维护 blog/cases/news/resources 等 fallback 数据的 locale 切换逻辑，
 * 避免每个数据文件重复 if-else。
 */

export interface LocalizedDataConfig<T> {
  zh: T[];
  en: T[];
  'zh-TW'?: T[];
}

export interface LocalizedEntryConfig<T> {
  zh: T;
  en: T;
  'zh-TW'?: T;
}

/**
 * 创建列表型多语言数据访问器
 * @returns { getItems, getItemMap, getByKey, defaultItems }
 */
export function createLocalizedData<T>(config: LocalizedDataConfig<T>) {
  function getItems(locale?: string): T[] {
    if (locale === 'en') return config.en;
    if (locale === 'zh-TW' && config['zh-TW']) return config['zh-TW'];
    return config.zh;
  }

  function getItemMap<K extends string | number | symbol>(
    locale?: string,
    keyFn: (item: T) => K = (item: any) => item.id ?? item.slug,
  ): Record<string, T> {
    return Object.fromEntries(getItems(locale).map((item) => [String(keyFn(item)), item]));
  }

  function getByKey(locale: string | undefined, key: string): T | undefined {
    return getItemMap(locale)[key];
  }

  return {
    getItems,
    getItemMap,
    getByKey,
    /** 兼容旧直接引用：默认中文 */
    defaultItems: config.zh,
  };
}

/**
 * 创建单条多语言数据访问器
 */
export function createLocalizedEntry<T>(config: LocalizedEntryConfig<T>) {
  function getEntry(locale?: string): T {
    if (locale === 'en') return config.en;
    if (locale === 'zh-TW' && config['zh-TW']) return config['zh-TW'];
    return config.zh;
  }
  return { getEntry, defaultEntry: config.zh };
}
