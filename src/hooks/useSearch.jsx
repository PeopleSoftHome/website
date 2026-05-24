import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SEARCH_INDEX, TYPE_LABELS } from '../data/searchIndex';

/**
 * useSearch — 全局搜索状态管理 Hook（Sprint 12 / v2.3.0）
 *
 * 功能：
 *  - 前端全文检索（标题 + tags + 描述，加权评分）
 *  - 150ms 防抖，避免每次键入都重算
 *  - ↑↓ 键盘导航 + Enter 跳转 + Esc 关闭
 *  - 搜索结果按 type 分组，每组最多 5 条
 *  - 关键词高亮（返回 HTML 字符串）
 */
export function useSearch(onClose) {
  const [query,    setQuery]    = useState('');
  const [focusIdx, setFocusIdx] = useState(-1);
  const debouncedRef = useRef(null);
  const inputRef     = useRef(null);

  /* ── 评分函数 ── */
  const scoreItem = useCallback((item, q) => {
    const lq = q.toLowerCase();
    let score = 0;

    // 标题命中：+100（包含）/ +150（完全匹配）
    const titleLower = item.title.toLowerCase();
    if (titleLower === lq)              score += 150;
    else if (titleLower.includes(lq))   score += 100;

    // tags 命中：每个 +40（包含）/ +60（完全匹配）
    item.tags.forEach(tag => {
      const tl = tag.toLowerCase();
      if (tl === lq)              score += 60;
      else if (tl.includes(lq))   score += 40;
      else if (lq.includes(tl) && tl.length > 1) score += 20;
    });

    // 描述命中：+15
    if (item.desc?.toLowerCase().includes(lq)) score += 15;

    // 权重系数修正
    score *= (item.weight ?? 1.0);

    return score;
  }, []);

  /* ── 搜索结果（防抖 150ms）── */
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleQueryChange = useCallback((val) => {
    setQuery(val);
    setFocusIdx(-1);
    clearTimeout(debouncedRef.current);
    debouncedRef.current = setTimeout(() => {
      setDebouncedQuery(val.trim());
    }, 150);
  }, []);

  /* ── 搜索结果（按 type 分组，每组最多 5 条）── */
  const groupedResults = useMemo(() => {
    if (!debouncedQuery) return {};

    const scored = SEARCH_INDEX
      .map(item => ({ item, score: scoreItem(item, debouncedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    // 按 type 分组，每组最多 5 条
    const groups = {};
    scored.forEach(({ item }) => {
      if (!groups[item.type]) groups[item.type] = [];
      if (groups[item.type].length < 5) groups[item.type].push(item);
    });

    return groups;
  }, [debouncedQuery, scoreItem]);

  /* ── 展平结果列表（用于键盘导航索引）── */
  const flatResults = useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  const totalResults = flatResults.length;

  /* ── 高亮函数：在文本中标记关键词（先转义 HTML 再高亮）── */
  const highlight = useCallback((text, q) => {
    if (!q || !text) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    // 防御性编码：对静态索引中的文本做 HTML 实体转义
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return safeText.replace(re, '<mark>$1</mark>');
  }, []);

  /* ── 跳转到 Section ── */
  const goToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* ── 选中结果 ── */
  const selectItem = useCallback((item) => {
    goToSection(item.section);
    onClose?.();
    setQuery('');
    setDebouncedQuery('');
    setFocusIdx(-1);
  }, [goToSection, onClose]);

  /* ── 键盘事件 ── */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, totalResults - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && focusIdx >= 0) {
      e.preventDefault();
      const item = flatResults[focusIdx];
      if (item) selectItem(item);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [flatResults, focusIdx, totalResults, selectItem, onClose]);

  /* ── 清理防抖 timer ── */
  useEffect(() => () => clearTimeout(debouncedRef.current), []);

  /* ── 打开时自动聚焦输入框 ── */
  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

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
