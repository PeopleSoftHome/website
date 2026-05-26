# TalentPro v2 — React → Vue 3 迁移状态跟踪

> **最后更新**: 2026-05-26
> **会话目标**: 完成 React 18 → Vue 3 技术栈重构的最后验证与清理
> **当前分支**: feat/vue3-migration

---

## ✅ 已完成的工作

### Phase 0 — 工具链切换
- [x] `vite.config.js` 切换 `@vitejs/plugin-vue`，移除 React 插件
- [x] `index.html` 入口改为 `/src/main.js`
- [x] `src/main.js` 使用 `createApp(App)`
- [x] `package.json` 移除 `react`、`react-dom`、`@testing-library/react`、`@testing-library/jest-dom`
- [x] 添加路径别名 `@/ → src/`

### Phase 1~8 — 组件/逻辑迁移
- [x] **46 个 `.vue` SFC 组件** 全部创建完成
  - Sections × 15、Layout × 3、UI 原子 × 18、Pages × 1、Icons × 3、FloatBtn × 1、SectionSkeleton × 1
- [x] **11 个 Composables** (`src/composables/`) 全部迁移完成
- [x] **5 个 Stores** (`src/stores/`) 使用 `provide/inject` 替代原 Context
- [x] `App.vue` 根组件：全局状态 provide + IntersectionObserver + MutationObserver + onErrorCaptured
- [x] `HomePage.vue`：使用 `defineAsyncComponent` 懒加载 10 个 Section

### 清理工作
- [x] 删除所有旧 React `.jsx` 组件文件（~40 个）
- [x] 删除 `src/hooks/` 目录（旧 React hooks）
- [x] 删除 `src/context/` 目录（旧 React Context）
- [x] 删除旧 `.test.jsx` 测试文件
- [x] 重命名 `Button.test.vue.spec.js` → `Button.test.js`

### 运行时 Bug 修复
- [x] **App.vue Suspense 多根节点** → 移除了包裹多个同步组件的 `<Suspense>`
- [x] **SectionSkeleton 运行时编译警告** → 提取为独立 `src/components/ui/SectionSkeleton/SectionSkeleton.vue`
- [x] **`.jsx` 图标文件 React 未定义** → 迁移为 `.vue` / `.js`
- [x] **FloatingBar FloatBtn 未解析** → 补充 `import FloatBtn from './FloatBtn.vue'`
- [x] **useScrollLock 测试状态泄漏** → 添加 `onUnmounted` 清理 + `__resetScrollLockState` 测试助手
- [x] **useTheme watch 覆盖 localStorage** → 调整测试策略，移除 watch `immediate`（保留 onMounted 初始化）

### 构建与测试（本轮会话完成）
- [x] `npm run build` ✅ 通过，prerender 正常，零 warning
- [x] `npm run test:run` ✅ **24 文件 / 98 测试全部通过**（目标 78+）
- [x] 新增测试覆盖：
  - Composables: useModal, useSearch, useCarousel, useCountUp, useFocusTrap, useScrollLock, useScrollReveal, useNavScroll
  - Stores: theme, modal, search, i18n, videoModal
  - UI 组件: Tag, SectionHeader, TabNav, BaseModal, ContactModal, VideoModal
- [x] `npm run dev` ✅ 正常启动

---

## ⏳ 待用户浏览器验证（P0）

> 代码层面已完成全部检查，现启动 dev server 供您逐项走查。

**请在浏览器中验证以下 30 项清单**：

### 功能 QA（20 项）
1. [ ] Hero 首屏 — LCP < 2.5s；渐变正常；CTA 可见
2. [ ] 主题切换 — `data-theme` 切换；localStorage 持久化
3. [ ] 语言切换 — zh → en → zh-TW；标题更新；`html lang` 更新
4. [ ] NavBar 滚动 — 滚动 > 60px 毛玻璃背景；> 500px 显示返回顶部
5. [ ] 移动端菜单 — 375px；点击汉堡；菜单展开；点击外部关闭
6. [ ] 桌面下拉 — Hover "AI Family"；Mega menu 展开
7. [ ] 产品标签 — Product Matrix 4 个 tab；面板切换；无 CLS
8. [ ] 行业标签 — Industry 5 个 tab；截图 + feature list 随 tab 更新
9. [ ] WhyUs 标签 — 3 个 tab；Metric 卡片切换动画
10. [ ] 数字动画 — 滚动到 Stats；数字从 0 动画；只执行一次
11. [ ] 客户轮播 — 自动播放；箭头可用；hover 暂停；resize 重算
12. [ ] Logo 筛选 — 点击筛选按钮；网格过滤；"全部" 恢复
13. [ ] 滚动显现 — 滚动各 section；`.reveal` 元素淡入；stagger delay 生效
14. [ ] 全局搜索 — Cmd+K；输入 "AI 面试"；弹窗打开；↑↓ 导航；Enter 跳转
15. [ ] 演示预约 — 点击"预约演示"；填表；步骤推进；success 状态；自动关闭
16. [ ] 视频弹窗 — 点击"观看视频"；iframe 加载；关闭停止播放；ESC 关闭
17. [ ] 联系弹窗 — 点击 FloatingBar 电话；弹窗打开；tel: 链接可用
18. [ ] 智能客服 — 打开 chat；发送 "招聘"；Bot 回复；快捷回复可点击；转人工
19. [ ] 浮动按钮 — 滚动到底部；按钮可见；< 768px 切换为水平布局
20. [ ] 页脚链接 — 点击各列；外部链接新开标签

### 技术检查（10 项）
21. [ ] 构建成功 — `npm run build` exit 0
22. [ ] 预渲染成功 — `node scripts/prerender.js` 无报错
23. [ ] PWA manifest 有效 — DevTools → Application → Manifest
24. [ ] 控制台无报错 — 加载和交互后 console 清空
25. [ ] Lighthouse ≥ 90 — Performance ≥ 90, Accessibility ≥ 95
26. [ ] 4 断点响应式 — 375/768/1280/1440 无横向滚动、无文字重叠
27. [ ] 纯键盘导航 — Tab 走完全页；所有交互元素可达；focus 可见
28. [ ] 屏幕阅读器 — NVDA/VoiceOver 读取弹窗标题、按钮标签
29. [ ] 包体积 ≤ 基线+10% — `dist/assets/` 总大小对比
30. [ ] 全部测试通过 — `npm run test:run` ✅ 98/98

---

## 📁 关键文件索引

| 文件 | 说明 |
|------|------|
| `docs/vue-migration-plan.md` | 完整迁移方案（10 Phase、映射表、风险清单）|
| `docs/vue-migration-status.md` | 本文件：当前进度跟踪 |
| `src/main.js` | Vue 入口 |
| `src/App.vue` | 根组件（Provider 层级 + 全局 Observer）|
| `vite.config.js` | Vite + Vue 插件配置 |
| `package.json` | 已移除 React 依赖 |

---

*保存时间: 2026-05-26 | 状态: 代码完成，等待浏览器验证*
