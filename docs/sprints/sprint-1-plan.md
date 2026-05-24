# Sprint 1 计划 — 工程初始化 + 设计系统 + NavBar + Footer

> **状态**：📋 待 PO 批准后执行
> **周期**：待定（建议：PO 确认文档后立即开始）
> **目标**：Vite + React 工程跑通，Design Token 落地，全局布局组件（NavBar / Footer）完成并可交互预览
> **涉及模块**：工程基础层 / SEC-01（顶部导航）/ SEC-13（页脚）
> **负责 Agent**：全栈开发 Agent

---

## Token 预算评估

| 任务 ID | 任务描述 | 需注入上下文 | 预估输入 Token | 预估输出 Token | 需拆分？ |
|--------|---------|-----------|-------------|-------------|--------|
| T1-01~04 | 工程初始化 + Token + 全局样式 | architecture.md §4 + design-system.md §1/10 | ≈ 10,000 | ≈ 5,000 | 否 |
| T1-05 | ModalContext + useModal | architecture.md §5（useModal）| ≈ 4,000 | ≈ 2,000 | 否 |
| T1-06~09 | NavBar + NavDropdown + MobileMenu + useNavScroll | design-system.md §7.1 + architecture.md §5 + demo.html（Nav 部分，约 200 行）| ≈ 15,000 | ≈ 8,000 | 否 |
| T1-10 | Footer 组件 | design-system.md §7 + demo.html（Footer 部分）| ≈ 6,000 | ≈ 3,000 | 否 |
| T1-11 | Button / Tag / SectionHeader 原子组件 | design-system.md §7.1~7.2 | ≈ 5,000 | ≈ 3,000 | 否 |
| T1-12 | App.jsx + HomePage.jsx 骨架 | architecture.md §3 | ≈ 3,000 | ≈ 1,500 | 否 |
| **合计** | | | **≈ 43,000** | **≈ 22,500** | ✅ 在预算内 |

---

## 任务清单

| ID | 模块 | 任务描述 | 类型 | 优先级 | 最小化变更范围 | 状态 |
|----|------|---------|------|-------|-------------|------|
| T1-01 | 工程 | Vite + React 18 项目初始化（`package.json` / `vite.config.js` / `index.html` / `src/main.jsx`）| 基础 | P0 | 新建项目骨架，无现有文件 | Todo |
| T1-02 | 工程 | 创建 `src/tokens/index.js`（Design Token JS 常量，完整版）| 基础 | P0 | 仅新建 tokens/index.js | Todo |
| T1-03 | 工程 | 创建 `src/styles/global.css`（`:root` CSS 变量同步自 tokens + Reset）| 基础 | P0 | 仅新建 global.css | Todo |
| T1-04 | 工程 | 创建 `src/styles/animations.css` + `src/styles/reveal.css` | 基础 | P0 | 仅新建两个动画文件 | Todo |
| T1-05 | 工程 | 创建 `src/context/ModalContext.js` + `src/hooks/useModal.js` | 基础 | P0 | 仅新建 context/ + hooks/ | Todo |
| T1-06 | SEC-01 | 实现 `NavBar` 主组件（桌面完整布局 + `useNavScroll` scrolled 态）| Feature | P0 | 仅新建 NavBar/ 目录 | Todo |
| T1-07 | SEC-01 | 实现 `NavDropdown` 组件（Mega 下拉 hover 展开 + 推广 Banner + 出现动画）| Feature | P0 | 仅新建 NavDropdown.jsx | Todo |
| T1-08 | SEC-01 | **[BUG-01 修复]** 实现 `MobileMenu` 组件（Hamburger → X 变换 + 全屏菜单从右侧滑入 + accordion 子菜单 + 遮罩关闭 + body 滚动锁定）| Bug+Feature | P0 | 仅新建 MobileMenu.jsx | Todo |
| T1-09 | SEC-01 | 实现 `useNavScroll` Hook（scroll 监听 + scrolled + showBackTop）| Feature | P0 | 仅新建 hooks/useNavScroll.js | Todo |
| T1-10 | SEC-13 | 实现 `Footer` 组件（4 列 Grid + 品牌列 + 3 链接列 + 版权行）| Feature | P0 | 仅新建 Footer/ 目录 | Todo |
| T1-11 | UI | 实现 `Button`（4 variants）/ `Tag`（3 variants）/ `SectionHeader`（light + dark）原子组件 | UI | P0 | 仅新建 ui/ 下对应目录 | Todo |
| T1-12 | 工程 | 实现 `App.jsx`（ModalContext.Provider + NavBar + HomePage + Footer + DemoModal 占位）+ `pages/HomePage.jsx`（空 Section 占位）| 基础 | P0 | 新建 App.jsx + pages/HomePage.jsx | Todo |

---

## 验收标准（DoD）

### 功能验收
- [ ] `npm run dev` 启动无报错，localhost:3000 可正常访问
- [ ] `npm run build` 构建无报错，`dist/` 产物存在

### NavBar — 桌面（1280px）
- [ ] 完整展示：Logo + 5个导航链接 + 电话 + 登录按钮 + 预约演示按钮
- [ ] 初始态：透明背景，白色文字（放置在深色 Hero 上方时可见）
- [ ] 滚动 > 60px：背景变白色 + 毛玻璃（`backdrop-filter: blur(12px)`），文字变深色
- [ ] 过渡动画：背景切换平滑，无闪烁
- [ ] Logo 在 scrolled 态显示为 `--primary` 蓝色（非渐变），清晰可读

### NavBar — 下拉菜单
- [ ] AI Family / 产品 / 解决方案 三个菜单 hover 后正确弹出（宽 560px，2列网格）
- [ ] 每个下拉项有图标 + 标题 + 描述
- [ ] 每个下拉底部有推广 Banner（图标 + 标题 + 日期 + 箭头）
- [ ] 弹出动画：`opacity 0→1` + `translateY -8px→0`，250ms
- [ ] 鼠标移出后下拉正确关闭

### NavBar — 移动端（375px）[BUG-01 修复验收]
- [ ] Hamburger 图标可见（3 条横线）
- [ ] 点击 Hamburger：菜单从右侧滑入（`translateX(100%) → 0`），图标变 X 形
- [ ] 点击 X：菜单收起，图标恢复 3 条线
- [ ] AI Family / 产品 / 解决方案 点击后 accordion 展开子菜单
- [ ] 同时只有一个子菜单展开（点击其他时收起当前）
- [ ] 点击遮罩（半透明黑色区域）关闭菜单
- [ ] 菜单展开时页面背景不可滚动

### NavBar — Tablet（768px）
- [ ] 导航链接隐藏，Hamburger 显示
- [ ] Logo 和右侧按钮保留

### Footer
- [ ] 4 列布局正确，品牌列比其他列稍宽
- [ ] 品牌列：Logo + 简介 + 售前/售后电话 + 热门 Tag 组
- [ ] 3 个链接列：标题 + 链接列表，hover 变白色
- [ ] 底部版权行：版权 + ICP + 隐私政策 + 服务条款
- [ ] Mobile（375px）：4 列变 1 列堆叠

### 原子组件
- [ ] `Button` 4 variants（primary / ghost / outline / white）样式正确
- [ ] `Button` hover 动画（translateY(-1px) + shadow）正常
- [ ] `Tag` light / dark / ai 三种样式正确
- [ ] `SectionHeader` light / dark 两种样式正确

### 代码质量
- [ ] 每个组件文件 < 150 行
- [ ] 所有颜色通过 `var(--token)` 引用，无硬编码色值
- [ ] `src/tokens/index.js` 与 `global.css :root` 变量完全对应
- [ ] 无 console.error / console.warn 输出

---

## 风险与依赖

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| NavBar hover 在触摸屏设备失效 | 中 | 低 | 在移动端已用 MobileMenu 替代，桌面 hover 问题不影响用户 |
| `backdrop-filter: blur` Safari 兼容性 | 低 | 低 | 加 `-webkit-backdrop-filter` 前缀，不支持时降级为纯白背景 |
| Vite 冷启动时 Google Fonts 加载慢 | 低 | 低 | 本地开发影响不大，生产环境加 `font-display: swap` |

---

## 预览计划

- **预览时间**：Sprint 1 任务全部完成后
- **预览内容**：PO 在浏览器中验证以下场景：
  1. 桌面 1440px：完整导航 + hover 下拉菜单
  2. 移动端 375px：Hamburger 开合 + 子菜单 accordion
  3. 页面滚动时导航颜色变化
  4. Footer 在各断点下的布局

---

*项目经理 Agent 产出 | Sprint 1 计划 | 2026-03-15*
