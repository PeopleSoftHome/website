/**
 * 全局搜索索引工厂
 *
 * 统一搜索记录的字段结构与默认值，避免各数据文件重复声明 type/section/icon/weight。
 */

export interface SearchIndexRaw {
  id: string;
  type: string;
  title: string;
  tags: string[];
  desc: string;
  section: string;
  icon?: string;
  weight?: number;
}

export interface SearchIndexItem extends SearchIndexRaw {
  icon: string;
  weight: number;
}

/**
 * 创建单条搜索记录，填充默认 icon 与 weight
 */
export function createSearchItem(raw: SearchIndexRaw): SearchIndexItem {
  return {
    ...raw,
    icon: raw.icon ?? 'file-text',
    weight: raw.weight ?? 0.8,
  };
}

/**
 * 批量创建搜索索引
 */
export function createSearchIndex(items: SearchIndexRaw[]): SearchIndexItem[] {
  return items.map(createSearchItem);
}

/**
 * 使用默认 type/section/icon/weight 批量创建同类型搜索索引
 */
export function createTypedSearchIndex(
  defaults: Omit<SearchIndexRaw, 'id' | 'title' | 'tags' | 'desc'>,
  items: Array<Omit<SearchIndexRaw, 'type' | 'section'>>,
): SearchIndexItem[] {
  return items.map((item) => createSearchItem({ ...defaults, ...item } as SearchIndexRaw));
}
