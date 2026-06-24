# Sprint 12 计划 — 全局搜索

> **状态**：📋 待 Sprint 11b 完成后执行（搜索索引文本依赖 i18n key 体系）
> **目标**：实现 Cmd+K 触发的全局搜索弹窗，覆盖产品 / 行业 / 资源 ~50 条索引
> **Token 预算**：输入 ≈ 20,500 / 输出 ≈ 14,300

---

## 任务清单

| ID | 任务 | 变更范围 | 状态 |
|----|------|---------|------|
| T12-01 | 新建 `src/data/searchIndex.js`（~50条，含 type / title / tags / desc）| 新建 | Todo |
| T12-02 | 新建 `src/hooks/useSearch.js`（算法 + 键盘导航 + 防抖）| 新建 | Todo |
| T12-03 | 新建 `src/context/SearchContext.js` | 新建 | Todo |
| T12-04 | 新建 `SearchModal.jsx` + `SearchModal.module.css` | 新建目录 | Todo |
| T12-05 | 更新 `NavBar.jsx`：搜索图标按钮 + `Cmd+K` 全局监听 | 追加 1 按钮 + 1 useEffect | Todo |
| T12-06 | 更新 `App.jsx`：包裹 `SearchContext.Provider` + 挂载 `<SearchModal />` | 追加 2 import + 2 行 JSX | Todo |

## searchIndex.js 结构（完整版）

每条记录含以下字段：
```js
{
  id:      string,        // 唯一 ID
  type:    'product' | 'industry' | 'resource' | 'feature' | 'general',
  title:   string,        // 搜索标题
  tags:    string[],      // 关键词数组（中英文混合）
  desc:    string,        // 搜索结果描述
  section: string,        // 页面 Section ID（用于滚动定位）
  icon:    string,        // 图标（Emoji，后续替换 SVG）
  weight:  number,        // 权重系数 0.5~1.0
}
```

**各类型条数规划**

| 类型 | 数量 | 示例 |
|------|------|------|
| product（产品）| 20 | 招聘管理、AI 面试官、低代码平台... |
| industry（行业）| 5 | 制造业、零售连锁、互联网... |
| resource（资源）| 6 | 白皮书 × 3、案例集、文章、视频 |
| feature（功能特色）| 12 | 智能排班、AI 初筛、360评估、薪酬核算... |
| general（通用）| 7 | 关于我们、联系我们、安全合规、定价... |

## SearchModal UI 详细规格

```
[搜索浮层]
───────────────────────────────────────
  遮罩：rgba(0,0,0,0.4)，z-index: 2500（介于 DemoModal 2000 和 VideoModal 3000 之间）
  容器：max-width: 640px，居中，top: 20%
  背景：var(--card-bg)（支持暗色模式）
  圆角：var(--radius-xl)，box-shadow: var(--shadow-xl)
  动画：scale(.97)→1 + opacity 0→1，200ms

[顶部搜索框]
  图标：🔍（左侧）  |  placeholder："搜索产品、行业方案、资源..."  |  ⌘K（右侧提示）  |  ESC
  输入框：全宽，无边框，font-size: 18px

[无输入时：热门搜索]
  标题：「🔥 热门搜索」（灰色小字）
  Tags：AI 招聘  |  制造业  |  白皮书  |  360评估  |  ROI计算

[有输入时：分类结果]
  ─── 产品 (N) ────────────────────────
  [SVG icon]  AI 面试官           不止评能力，更要测潜力  →
  [SVG icon]  AI 招聘助手         智能简历筛选、JD生成    →
  ─── 行业方案 (N) ────────────────────
  [Icon]      制造业方案          智能排班+试工管理        →
  ─── 资源 (N) ────────────────────────
  [Icon]      AI 面试官案例集                             →

[底部提示]
  ↑↓ 导航    Enter 跳转    Esc 关闭
```

## 键盘导航实现

```js
// useSearch.js（核心逻辑）
const [focusIdx, setFocusIdx] = useState(-1);

const handleKeyDown = (e) => {
  if (e.key === 'ArrowDown') setFocusIdx(i => Math.min(i + 1, results.length - 1));
  if (e.key === 'ArrowUp')   setFocusIdx(i => Math.max(i - 1, 0));
  if (e.key === 'Enter' && focusIdx >= 0) {
    const item = results[focusIdx];
    scrollToSection(item.section);
    closeSearch();
  }
  if (e.key === 'Escape') closeSearch();
};
```

## 验收标准

- [ ] Cmd+K / Ctrl+K 触发搜索弹窗
- [ ] NavBar 搜索图标触发搜索弹窗
- [ ] 输入「AI」返回 AI 系列产品结果（分类显示）
- [ ] 输入「排班」返回制造业方案
- [ ] 搜索结果关键词高亮（`<mark>` 标签）
- [ ] ↑↓ 导航焦点，Enter 跳转到对应 Section
- [ ] 无结果显示「未找到 "{query}"」+ 热门搜索
- [ ] Esc / 点击遮罩关闭
- [ ] 暗色模式下背景、文字、高亮颜色正确
- [ ] Mobile 375px：搜索图标显示，弹窗全屏展开
