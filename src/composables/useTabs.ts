/**
 * useTabs — 通用 Tab 切换状态
 * ProductMatrix / Industry / WhyUs 三处共用
 *
 * @param {number} initialIndex - 初始激活 Tab 的索引（默认 0）
 * @returns {{ activeIndex: Ref<number>, selectTab: (index: number) => void }}
 */
import { ref } from 'vue';

export function useTabs(initialIndex: number = 0) {
  const activeIndex = ref<number>(initialIndex);
  const selectTab = (index: number) => { activeIndex.value = index; };
  return { activeIndex, selectTab };
}
