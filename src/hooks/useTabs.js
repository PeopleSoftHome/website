import { useState, useCallback } from 'react';

/**
 * useTabs — 通用 Tab 切换状态
 * ProductMatrix / Industry / WhyUs 三处共用
 *
 * @param {number} initialIndex - 初始激活 Tab 的索引（默认 0）
 * @returns {{ activeIndex, selectTab }}
 */
export function useTabs(initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const selectTab = useCallback((index) => setActiveIndex(index), []);
  return { activeIndex, selectTab };
}
