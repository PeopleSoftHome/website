/**
 * useSearch — 全局搜索状态管理 Composable
 *
 * 功能：
 *  - 前端全文检索（标题 + tags + 描述，加权评分）
 *  - 150ms 防抖，避免每次键入都重算
 *  - ↑↓ 键盘导航 + Enter 跳转 + Esc 关闭
 *  - 搜索结果按 type 分组，每组最多 5 条
 *  - 关键词高亮（返回 HTML 字符串）
 */
import { ref, computed, onUnmounted } from 'vue';
import { SEARCH_INDEX, TYPE_LABELS } from '@/data/searchIndex.js';

export function useSearch(onClose) {
  const query = ref('');
  const focusIdx = ref(-1);
  let debouncedTimer = null;
  const inputRef = ref(null);
  const debouncedQuery = ref('');

  /* ── 评分函数 ── */
  const scoreItem = (item, q) => {
    const lq = q.toLowerCase();
    let score = 0;

    const titleLower = item.title.toLowerCase();
    if (titleLower === lq) score += 150;
    else if (titleLower.includes(lq)) score += 100;

    item.tags.forEach(tag => {
      const tl = tag.toLowerCase();
      if (tl === lq) score += 60;
      else if (tl.includes(lq)) score += 40;
      else if (lq.includes(tl) && tl.length > 1) score += 20;
    });

    if (item.desc?.toLowerCase().includes(lq)) score += 15;
    score *= (item.weight ?? 1.0);
    return score;
  };

  /* ── 防抖查询 ── */
  const handleQueryChange = (val) => {
    query.value = val;
    focusIdx.value = -1;
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      debouncedQuery.value = val.trim();
    }, 150);
  };

  /* ── 搜索结果（按 type 分组，每组最多 5 条）── */
  const groupedResults = computed(() => {
    if (!debouncedQuery.value) return {};

    const scored = SEARCH_INDEX
      .map(item => ({ item, score: scoreItem(item, debouncedQuery.value) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    const groups = {};
    scored.forEach(({ item }) => {
      if (!groups[item.type]) groups[item.type] = [];
      if (groups[item.type].length < 5) groups[item.type].push(item);
    });

    return groups;
  });

  const flatResults = computed(() => Object.values(groupedResults.value).flat());
  const totalResults = computed(() => flatResults.value.length);

  /* ── 高亮函数：在文本中标记关键词 ── */
  const highlight = (text, q) => {
    if (!q || !text) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return safeText.replace(re, '<mark>$1</mark>');
  };

  /* ── 跳转到 Section ── */
  const goToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── 选中结果 ── */
  const selectItem = (item) => {
    goToSection(item.section);
    onClose?.();
    query.value = '';
    debouncedQuery.value = '';
    focusIdx.value = -1;
  };

  /* ── 键盘事件 ── */
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIdx.value = Math.min(focusIdx.value + 1, totalResults.value - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIdx.value = Math.max(focusIdx.value - 1, -1);
    } else if (e.key === 'Enter' && focusIdx.value >= 0) {
      e.preventDefault();
      const item = flatResults.value[focusIdx.value];
      if (item) selectItem(item);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  /* ── 清理防抖 timer ── */
  onUnmounted(() => clearTimeout(debouncedTimer));

  /* ── 打开时自动聚焦输入框 ── */
  const focusInput = () => {
    setTimeout(() => inputRef.value?.focus(), 50);
  };

  return {
    query,
    handleQueryChange,
    groupedResults,
    flatResults,
    focusIdx,
    totalResults,
    highlight,
    selectItem,
    handleKeyDown,
    inputRef,
    focusInput,
    TYPE_LABELS,
  };
}
