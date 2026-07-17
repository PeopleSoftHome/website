/**
 * useSearch — 全局搜索状态管理 Composable
 *
 * 功能：
 *  - 优先调用后端搜索 API，失败时回退到前端本地索引检索
 *  - 150ms 防抖，避免每次键入都重算
 *  - ↑↓ 键盘导航 + Enter 跳转 + Esc 关闭
 *  - 搜索结果按 type 分组，每组最多 5 条
 *  - 关键词高亮（返回 HTML 字符串）
 */
import { ref, computed, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import { SEARCH_INDEX, TYPE_LABELS } from '@/data/searchIndex';
import { searchApi } from '@/api/search';
import { transformSearchResults } from '@/api/transforms';

interface SearchItem {
  id: string;
  type: string;
  title: string;
  tags: string[];
  desc: string;
  section: string;
  icon: string;
  weight?: number;
}

interface SuggestionItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  icon: string;
  section: string;
}

export function useSearch(onClose?: (() => void) | undefined) {
  const query = ref('');
  const focusIdx = ref(-1);
  let debouncedTimer: ReturnType<typeof setTimeout> | null = null;
  const inputRef: Ref<HTMLInputElement | null> = ref(null);
  const debouncedQuery = ref('');
  const apiResults: Ref<SearchItem[]> = ref([]);
  const isSearching = ref(false);

  /* ── 本地评分函数（fallback）── */
  const scoreItem = (item: SearchItem, q: string) => {
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
  const handleQueryChange = (val: string) => {
    query.value = val;
    focusIdx.value = -1;
    if (debouncedTimer) clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      debouncedQuery.value = val.trim();
    }, 150);
  };

  /* ── API 搜索 ── */
  const suggestions: Ref<SuggestionItem[]> = ref([]);
  watch(debouncedQuery, async (q) => {
    if (!q) {
      apiResults.value = [];
      suggestions.value = [];
      return;
    }
    isSearching.value = true;
    try {
      const [searchRes, suggestRes] = await Promise.all([
        (searchApi.search as (q: string) => Promise<unknown>)(q),
        q.length >= 2 ? searchApi.getSuggestions(q) : Promise.resolve([]),
      ]);
      apiResults.value = transformSearchResults((searchRes as { data?: unknown[] }).data || []) as SearchItem[];
      suggestions.value = ((suggestRes as { data?: unknown[] }).data || []) as SuggestionItem[];
    } catch (e) {
      apiResults.value = [];
      suggestions.value = [];
      const err = e as Error;
      if (import.meta.env.DEV) console.warn('[Search API]', err.message);
    } finally {
      isSearching.value = false;
    }
  });

  /* ── 搜索结果（优先 API，fallback 本地索引）── */
  const groupedResults = computed(() => {
    if (!debouncedQuery.value) return {};

    let results: SearchItem[] = [];
    if (apiResults.value.length > 0) {
      results = apiResults.value;
    } else {
      results = (SEARCH_INDEX as SearchItem[])
        .map(item => ({ item, score: scoreItem(item, debouncedQuery.value) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
    }

    const groups: Record<string, SearchItem[]> = {};
    results.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = [];
      const group = groups[item.type];
      if (group && group.length < 5) group.push(item);
    });

    return groups;
  });

  const flatResults = computed(() => Object.values(groupedResults.value).flat());
  const totalResults = computed(() => flatResults.value.length);

  /* ── 高亮函数：在文本中标记关键词 ── */
  const highlight = (text: string, q: string) => {
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
  const goToSection = (sectionId: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── 选中结果：API 结果（URL）路由跳转，本地索引结果（锚点 id）滚动 ── */
  const router = useRouter();
  const selectItem = (item: SearchItem) => {
    if (item.section && item.section.startsWith('/')) {
      if (router) {
        router.push(item.section);
      } else if (typeof window !== 'undefined') {
        // 无路由上下文（如测试/独立挂载）时降级为整页跳转
        window.location.assign(item.section);
      }
    } else {
      goToSection(item.section);
    }
    onClose?.();
    query.value = '';
    debouncedQuery.value = '';
    focusIdx.value = -1;
    apiResults.value = [];
  };

  /* ── 键盘事件 ── */
  const handleKeyDown = (e: KeyboardEvent) => {
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
  onUnmounted(() => { if (debouncedTimer) clearTimeout(debouncedTimer); });

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
    isSearching,
    highlight,
    selectItem,
    handleKeyDown,
    inputRef,
    focusInput,
    TYPE_LABELS,
    debouncedQuery,
    suggestions,
  };
}
