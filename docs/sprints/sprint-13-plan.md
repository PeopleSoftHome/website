# Sprint 13 计划 — v2.3.0 Bug 修复批次

> **产出角色**：项目经理 Agent  
> **日期**：2026-03-16  
> **周期**：Sprint 13（预计 1 天，单次执行）  
> **目标**：清零 v2.3.0 GA 验收发现的 11 条缺陷，发布 v2.3.1 Hotfix

---

## 一、Sprint 目标

```
P0 全清（7条）：页面空白、数字错误、导航交互失效、滚动动画缺失
P1 全清（4条）：Hero 视觉、搜索 UX 重设计、咨询入口、轮播效果
```

---

## 二、执行顺序与任务清单

### 阶段 1 — P0 致命 Bug（必须先修，影响页面主体内容）

| Task ID | Bug | 文件 | 改动 | 预估行数 |
|---------|-----|------|------|---------|
| T13-01 | BUG-105 Stats 双重 suffix | `StatsSection.jsx` | 删除多余的 `<span className={styles.suffix}>{suffix}</span>` | -3 行 |
| T13-02 | BUG-104 Marquee 动画 | `BrandScrollSection.module.css` | 添加本地 `@keyframes marquee` 声明 | +5 行 |
| T13-03 | **BUG-106/107/109b/110 reveal 根因** | `App.jsx` | 添加全局 IntersectionObserver + MutationObserver，观察所有裸 `.reveal` 元素，触发 `is-visible` | +25 行 |
| T13-04 | BUG-107 AiCard 默认值 | `AiCard.jsx` | 修正 `linkText = "{linkText}"` → `linkText = "产品详情 →"` | -1 行 +1 行 |
| T13-05 | BUG-101 NavDropdown 间隙 | `NavDropdown.module.css` | `.dropdown::before` 添加透明桥接伪元素，覆盖 8px 间隙 | +8 行 |
| T13-06 | BUG-109a Logo 筛选错位 | `LogoWallSection.module.css` | `.hidden` 改为 `visibility:hidden` + `pointer-events:none`，保持占位但透明；同时调整 grid gap | +3 行 |

### 阶段 2 — P1 体验 Bug

| Task ID | Bug | 文件 | 改动 |
|---------|-----|------|------|
| T13-07 | BUG-103a Hero 浅色背景 | `HeroSection.module.css` + `HeroSection.jsx` | 改为浅色渐变背景，文字由白改黑/深色，标题保留渐变高亮 |
| T13-08 | BUG-103b Dashboard 卡片去斜角 | `HeroSection.module.css` | `.deviceFrame` 移除 `perspective/rotateY/rotateX`，改为正视图 + 轻微 float 动画 |
| T13-09 | BUG-108 轮播 hover 悬停 | `TestimonialSection.module.css` + 验证 | 确认 `bindPauseEvents` 正常绑定，添加 hover 时光标 cursor 变化的视觉反馈 |
| T13-10 | BUG-102 搜索内联展开 | `NavBar.jsx` + `NavBar.module.css` + `SearchContext` | 搜索图标点击后在 NavBar 右侧内联展开输入框（宽度动画），其余按钮向右压缩；⌘K 提示改为 placeholder 文字 |
| T13-11 | BUG-111 在线咨询 | `FloatingBar.jsx` + 新增 `ContactModal` 小组件 | 点击「在线咨询」弹出联系方式小卡片（电话、企业微信二维码占位） |

---

## 三、关键技术方案详述

### T13-03 全局 reveal 观察者（最重要）

```jsx
// App.jsx 新增 useEffect
useEffect(() => {
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.08 }
  );

  // 初次扫描 + Tab 切换后新元素
  const scan = () =>
    document.querySelectorAll('.reveal:not(.is-visible)')
      .forEach(el => io.observe(el));

  scan();

  // MutationObserver：监听 DOM 新增节点（Tab 切换时产品卡片重新渲染）
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });

  return () => { io.disconnect(); mo.disconnect(); };
}, []);
```

### T13-05 NavDropdown 桥接伪元素

```css
/* NavDropdown.module.css 追加 */
.dropdown::before {
  content: '';
  position: absolute;
  top: -10px;       /* 向上延伸 10px，覆盖间隙 */
  left: 0;
  right: 0;
  height: 10px;     /* 桥接高度 ≥ gap 值 */
}
```

### T13-10 搜索内联展开

```
展开前：[🔍]  [🌐 中文 ▾]  [🌙]  [登录]  [预约演示]
展开后：[🔍 搜索产品、行业方案...______________ ×]  [🌐]  [🌙]  [登录]  [预约演示]
         ↑ 输入框向左展开，max-width: 0 → 240px，transition: max-width 0.3s
```

---

## 四、验收矩阵

| Bug ID | 验收标准 |
|--------|---------|
| BUG-101 | 鼠标从导航 label 缓慢移向下拉菜单，菜单保持显示 |
| BUG-102 | 点击搜索图标，输入框在 NavBar 右侧向左展开；输入关键词有结果 |
| BUG-103 | Hero 区域背景为浅色；Dashboard 卡片为正视图（无斜角） |
| BUG-104 | 品牌 Logo 区域有水平滚动动画，hover 暂停 |
| BUG-105 | 8000+ / 2000万+ / 99.9% 数字显示正确，无重复后缀 |
| BUG-106 | 点击产品矩阵任意 Tab，下方卡片内容可见 |
| BUG-107 | AI Family 区域显示 4 张卡片 + Banner |
| BUG-108 | 证言轮播自动滚动，鼠标悬停暂停 |
| BUG-109 | Logo 筛选后正确对齐（隐藏项不占空间）；WhyUs 指标卡片可见 |
| BUG-110 | 资源中心显示 6 张资源卡 |
| BUG-111 | 点击「在线咨询」弹出联系卡片 |

---

## 五、文件变更清单（预估）

```
修改（11 个文件）：
  src/App.jsx                                    ← T13-03 全局 reveal 观察者
  src/components/layout/NavBar/NavBar.jsx        ← T13-10 搜索内联展开
  src/components/layout/NavBar/NavBar.module.css ← T13-10
  src/components/sections/HeroSection/HeroSection.module.css  ← T13-07/08
  src/components/sections/HeroSection/HeroSection.jsx         ← T13-07
  src/components/sections/BrandScrollSection/BrandScrollSection.module.css ← T13-02
  src/components/sections/StatsSection/StatsSection.jsx       ← T13-01
  src/components/sections/AiFamilySection/AiCard.jsx          ← T13-04
  src/components/ui/SearchModal/SearchContext.js              ← T13-10
  src/components/layout/NavBar/NavDropdown.module.css         ← T13-05
  src/components/sections/LogoWallSection/LogoWallSection.module.css ← T13-06

新增（1 个文件）：
  src/components/ui/ContactModal/ContactModal.jsx            ← T13-11
```

---

## 六、风险说明

| 风险 | 概率 | 缓解措施 |
|------|------|---------|
| T13-03 MutationObserver 频繁触发性能问题 | 中 | 使用 `scan` 函数防抖 50ms，scan 内检测 `:not(.is-visible)` 避免重复 observe |
| T13-07 Hero 浅色改造影响响应式断点 | 低 | 同步修改 768px/1024px 媒体查询，文字颜色适配 |
| T13-10 搜索内联展开在小屏幕溢出 | 中 | 移动端 ≤1023px 保持现有点击弹窗方式，内联展开仅在桌面端生效 |

---

*项目经理 Agent · Sprint 13 计划 · v2.3.1 Hotfix · 2026-03-16*
