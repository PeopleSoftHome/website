# TalentPro v2 — React 18 → Vue 3 重构方案

> **版本**: v1.0  
> **日期**: 2026-05-24  
> **范围**: 第一阶段（前端技术栈迁移）  
> **工作量**: ~100 engineering hours（约 3 周）

---

## 1. 执行摘要

当前 TalentPro v2 是基于 React 18 + Vite 的单页静态营销门户，包含 ~50 个 JSX/JS 源文件、~38 个 CSS Module、15 个测试文件。

本方案将其完整迁移至 **Vue 3.4+（Composition API / `<script setup>`）**，保留 Vite 构建工具链和 Vitest 测试框架。迁移后预计带来：

- **包体积缩减**: vendor ~42KB → ~34KB gzipped
- **代码量减少**: ~20% 组件代码（无需 `useMemo`/`useCallback` 样板）
- **开发体验提升**: 更直观的响应式系统、内置 Teleport/Suspense/Transition
- **可维护性**: 为第二阶段后端服务对接奠定更清晰的架构基础

**决策核心**: 采用**受控大爆炸重写**（Controlled Big-Bang），因为本站是单页无路由应用，不存在跨页面状态，Strangler Fig 模式的 wrapper 开销将超过重写成本本身。

---

## 2. 目标架构设计

### 2.1 技术栈选型

| 层级 | 当前 | 目标 | 理由 |
|------|------|------|------|
| 框架 | React 18.3.1 | Vue 3.4+ | 更好的响应式系统、更少的样板代码 |
| 构建工具 | Vite 5 + @vitejs/plugin-react | Vite 5 + @vitejs/plugin-vue | 同构，仅需换插件 |
| 状态管理 | React Context × 5 | `provide/inject` + Composables | 状态简单，无需 Pinia |
| 样式 | CSS Modules | 保留 CSS Modules | 零风险，Vite 原生支持 `<style module>` |
| 国际化 | 自定义 `interpolate()` | 保留自定义系统（封装为 composable） | 避免同 sprint 引入 vue-i18n 复杂度 |
| 测试 | Vitest + @testing-library/react | Vitest + @vue/test-utils | 同测试运行器，换断言库 |
| 路由 | 无（单页） | 无 | 暂不引入 Vue Router |
| PWA | vite-plugin-pwa | 保留 | 框架无关 |

### 2.2 为什么不选 Pinia / Vue Router / Vue I18n？

- **Pinia**: 5 个 Context 的状态复杂度极低（boolean 开关 + 简单对象），`provide/inject` 足够；引入 Pinia 会增加概念负担和包体积。
- **Vue Router**: 当前只有首页，无多页需求。后端对接后若扩展页面，再引入不迟。
- **Vue I18n**: ~600 键 × 3 语言，当前自定义 `interpolate()` 语法 `{var}` 与 Vue I18n 兼容，但迁移 i18n 库本身是一个大任务。建议作为 **v2.4.0+ 的独立优化项**。

### 2.3 目录结构映射

```
src/
├── main.js                          ← 入口（原 main.jsx）
├── App.vue                          ← 根组件（原 App.jsx）
├── composables/                     ← 原 hooks/ 目录
│   ├── useTabs.js
│   ├── useCountUp.js
│   ├── useCarousel.js
│   ├── useScrollLock.js
│   ├── useFocusTrap.js
│   ├── useScrollReveal.js
│   ├── useNavScroll.js
│   ├── useModal.js
│   ├── useTheme.js
│   ├── useSearch.js
│   └── useVideoModal.js
├── components/
│   ├── ui/                          ← 原子组件 + 弹窗
│   │   ├── Button.vue               ← 原 Button/Button.jsx
│   │   ├── Tag.vue
│   │   ├── SectionHeader.vue
│   │   ├── TabNav.vue
│   │   ├── RevealWrapper.vue
│   │   ├── BaseModal.vue
│   │   ├── DemoModal/
│   │   │   ├── DemoModal.vue
│   │   │   ├── ModalStep1.vue
│   │   │   ├── ModalStep2.vue
│   │   │   ├── ModalStep3.vue
│   │   │   └── ModalSuccess.vue
│   │   ├── VideoModal.vue
│   │   ├── SearchModal.vue
│   │   ├── ContactModal.vue
│   │   ├── ChatBot/
│   │   │   ├── ChatBot.vue
│   │   │   └── chatData.js
│   │   ├── ErrorBoundary.vue        ← 或 App.vue 中 onErrorCaptured
│   │   └── ProductIcons/            ← SVG 图标库，无需框架绑定
│   ├── layout/
│   │   ├── NavBar/
│   │   │   ├── NavBar.vue
│   │   │   ├── MobileMenu.vue
│   │   │   └── NavDropdown.vue
│   │   └── Footer.vue
│   ├── sections/
│   │   ├── HeroSection.vue
│   │   ├── BrandScrollSection.vue
│   │   ├── StatsSection.vue
│   │   ├── ProductMatrixSection/
│   │   │   ├── ProductMatrixSection.vue
│   │   │   └── ProductCard.vue
│   │   ├── AiFamilySection/
│   │   │   ├── AiFamilySection.vue
│   │   │   └── AiCard.vue
│   │   ├── IndustrySolutionSection/
│   │   │   ├── IndustrySolutionSection.vue
│   │   │   └── ProductScreenshot.vue
│   │   ├── TestimonialSection/
│   │   │   ├── TestimonialSection.vue
│   │   │   └── TestimonialCard.vue
│   │   ├── LogoWallSection.vue
│   │   ├── WhyUsSection/
│   │   │   ├── WhyUsSection.vue
│   │   │   └── MetricCard.vue
│   │   ├── ResourceSection/
│   │   │   ├── ResourceSection.vue
│   │   │   └── ResourceCard.vue
│   │   ├── CtaBannerSection.vue
│   │   └── FloatingBar.vue
│   └── icons/                       ← 原 components/icons/
├── pages/
│   └── HomePage.vue                 ← 组装所有 section
├── stores/                          ← provide/inject 包装器（轻量）
│   ├── i18n.js                      ← 原 i18n/index.jsx 逻辑
│   ├── theme.js
│   ├── modal.js
│   ├── search.js
│   └── videoModal.js
├── data/                            ← 纯静态数据，0 改动
├── tokens/                          ← 设计 token，0 改动
├── styles/                          ← global.css / animations.css / reveal.css，0 改动
└── test/
    └── setup.js                     ← 换 import: @vue/test-utils
```

---

## 3. React → Vue 3 核心映射

### 3.1 Hooks → Composables（1:1 映射）

| React Hook | Vue 3 Composable | 关键差异 |
|------------|------------------|----------|
| `useState(x)` | `ref(x)` / `reactive({x})` | `ref` 需 `.value` 访问；`reactive` 仅对对象有效 |
| `useEffect(fn, [])` | `onMounted(fn)` | 语义完全一致 |
| `useEffect(fn, [dep])` | `watch(dep, fn)` / `watchEffect(fn)` | Vue 自动追踪依赖，无需数组 |
| `useCallback(fn, [deps])` | 直接定义函数 | Vue 不需要回调 memoization |
| `useMemo(fn, [deps])` | `computed(fn)` | 自动缓存，无依赖数组 |
| `useRef(null)` (DOM) | `ref(null)` | 模板中用 `:ref="elRef"`；DOM ref 建议用 `shallowRef` |
| `createContext` + `useContext` | `provide(key, value)` + `inject(key)` | 用 Symbol 作 key 避免冲突 |
| `lazy(() => import(...))` | `defineAsyncComponent(() => import(...))` | 用法几乎一致 |
| `<Suspense>` | `<Suspense>` | Vue 支持 `#default` / `#fallback` 插槽 |
| `createPortal` | `<Teleport to="body">` | 声明式语法，更简洁 |
| `ErrorBoundary` (class) | `onErrorCaptured` / `app.config.errorHandler` | 可在 App.vue 或任意组件捕获 |

### 3.2 复杂组件迁移示例

#### 示例 A: BaseModal（React → Vue）

**React 版（当前）:**
```jsx
export default function BaseModal({ isOpen, onClose, ariaLabel, children }) {
  useScrollLock(isOpen);
  const { ref: focusRef } = useFocusTrap(isOpen, onClose);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div ref={focusRef} role="dialog" aria-modal="true" aria-label={ariaLabel}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}
```

**Vue 3 版:**
```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" ref="containerRef" role="dialog" aria-modal="true"
           :aria-label="ariaLabel" class="overlay" @click="onOverlayClick">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useScrollLock } from '@/composables/useScrollLock.js';
import { useFocusTrap } from '@/composables/useFocusTrap.js';

const props = defineProps({ isOpen: Boolean, ariaLabel: String });
const emit  = defineEmits(['close']);

const containerRef = ref(null);

useScrollLock(() => props.isOpen);
useFocusTrap(containerRef, () => props.isOpen, () => emit('close'));

function onOverlayClick(e) {
  if (e.target === e.currentTarget) emit('close');
}

function onKey(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close');
}
watch(() => props.isOpen, (open) => {
  if (open) document.addEventListener('keydown', onKey);
  else document.removeEventListener('keydown', onKey);
}, { immediate: true });
onUnmounted(() => document.removeEventListener('keydown', onKey));
</script>
```

#### 示例 B: useSearch Hook → Composable

**React 版（154 行，核心逻辑）:**
```js
export function useSearch(items) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  // ... debounce, scoring, highlighting, keyboard nav
}
```

**Vue 3 版:**
```js
import { ref, computed, watch } from 'vue';

export function useSearch(items) {
  const query = ref('');
  const activeIndex = ref(-1);

  // 算法保持 verbatim
  const results = computed(() => {
    if (!query.value.trim()) return [];
    // ... 同样的 scoring / grouping / highlighting 逻辑
  });

  const totalResults = computed(() => results.value.reduce((sum, g) => sum + g.items.length, 0));

  function selectNext() { /* same logic */ }
  function selectPrev() { /* same logic */ }
  function reset() { query.value = ''; activeIndex.value = -1; }

  return { query, results, activeIndex, totalResults, selectNext, selectPrev, reset };
}
```

**关键**: `useSearch` 是纯算法逻辑（无 DOM 操作），可直接逐行迁移到 `computed` + `ref`。

### 3.3 App.vue 组装示例

**React App.jsx（当前）:**
```jsx
<I18nProvider>
  <ThemeContext.Provider value={themeCtx}>
    <SearchProvider>
      <ModalContext.Provider value={modal}>
        <VideoModalContext.Provider value={videoModal}>
          <NavBar /><main id="main-content"><HomePage /></main><Footer />
          <FloatingBar ... />
          <Suspense fallback={null}>
            <DemoModal /><VideoModal /><SearchModal />
            <ContactModal isOpen={contactOpen} onClose={...} />
            <ChatBot isOpen={chatOpen} onClose={...} />
          </Suspense>
        </VideoModalContext.Provider>
      </ModalContext.Provider>
    </SearchProvider>
  </ThemeContext.Provider>
</I18nProvider>
```

**Vue 3 App.vue:**
```vue
<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <NavBar />
  <main id="main-content">
    <HomePage />
  </main>
  <Footer />
  <FloatingBar @open-chat="chatOpen = true" @open-contact="contactOpen = true" />

  <Suspense>
    <template #default>
      <DemoModal />
      <VideoModal />
      <SearchModal />
      <ContactModal :is-open="contactOpen" @close="contactOpen = false" />
      <ChatBot :is-open="chatOpen" @close="chatOpen = false" @open-demo="modal.open(); chatOpen = false" />
    </template>
  </Suspense>
</template>

<script setup>
import { ref, provide, onErrorCaptured } from 'vue';
import { createI18n } from '@/stores/i18n.js';
import { createTheme } from '@/stores/theme.js';
import { createModal } from '@/stores/modal.js';
import { createSearch } from '@/stores/search.js';
import { createVideoModal } from '@/stores/videoModal.js';

/* 初始化全局状态 */
const i18n = createI18n();
const theme = createTheme();
const modal = createModal();
const search = createSearch();
const videoModal = createVideoModal();

provide('i18n', i18n);
provide('theme', theme);
provide('search', search);
provide('modal', modal);
provide('videoModal', videoModal);

const contactOpen = ref(false);
const chatOpen = ref(false);

/* 全局错误捕获（替代 ErrorBoundary） */
onErrorCaptured((err, instance, info) => {
  console.error('[Vue Error]', err, info);
  return false; // 阻止向上传播
});

/* 全局 scroll reveal 观察器（原 App.jsx useEffect） */
// 可提取为 useGlobalReveal() composable，保持 App.vue 简洁
</script>
```

### 3.4 HomePage.vue 懒加载迁移

**React 版:**
```jsx
<Suspense fallback={<SectionSkeleton height={260} />}><StatsSection /></Suspense>
```

**Vue 3 版:**
```vue
<template>
  <HeroSection />
  <Suspense>
    <template #fallback><SectionSkeleton :height="260" /></template>
    <StatsSection />
  </Suspense>
  <!-- ... 其余 9 个 section 同理 -->
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import HeroSection from '@/components/sections/HeroSection.vue';
const StatsSection = defineAsyncComponent(() => import('@/components/sections/StatsSection.vue'));
// ...
</script>
```

---

## 4. 十阶段执行计划

```
┌────────────────────────────────────────────────────────────────────────┐
│  PHASE 0: 工具链与脚手架        4h                                     │
│  ├── npm install vue@^3.4 @vitejs/plugin-vue @vue/test-utils           │
│  ├── 更新 vite.config.js（换 vue 插件，去 react 插件）                │
│  ├── 更新 vitest.config.js（测 Vue SFC）                               │
│  ├── 添加路径别名 @/ → src/                                            │
│  ├── 创建 src/App.vue 空壳验证 dev server 正常                         │
│  └── 打 tag: v2.3.4-react-final（不可变基线）                          │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 1: 叶子节点              4h                                     │
│  ├── src/data/*      纯常量，路径改 @/data/* 即可                      │
│  ├── src/tokens/*    纯常量，0 改动                                   │
│  ├── src/styles/*    CSS 文件，0 改动                                  │
│  ├── src/i18n/interpolate.js / keyMap.js / locales/*.json             │
│  └── src/test/setup.js  改 import '@vue/test-utils'                   │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 2: Composables（Hooks）  12h                                    │
│  ├── useTabs, useVideoModal      （最简单，先行验证测试管线）           │
│  ├── useCountUp, useScrollReveal （IO + RAF，测试需 mock）            │
│  ├── useNavScroll                 （scroll + RAF）                     │
│  ├── useScrollLock                （模块级 ref-counter）               │
│  ├── useFocusTrap                 （DOM 操作 + a11y）                  │
│  ├── useTheme                     （localStorage + matchMedia）        │
│  ├── useModal                     （多步状态机 + timer）               │
│  └── useSearch                    （搜索算法 + 键盘导航）              │
│  每个 composable 配一个 .test.js，共 10 个 × (编码 1h + 测试 0.5h)    │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 3: 全局状态（Stores）     6h                                    │
│  ├── stores/i18n.js      提取 I18nProvider 逻辑为 createI18n()        │
│  ├── stores/theme.js     提取 useTheme 为 provide -ready 对象        │
│  ├── stores/modal.js     useModal 包装                                               │
│  ├── stores/search.js    SearchProvider 逻辑提取                                      │
│  ├── stores/videoModal.js useVideoModal 包装                                         │
│  └── 为每个 store 写测试，验证 provide/inject 工作正常                               │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 4: UI 原子组件            8h                                    │
│  ├── Button, Tag, SectionHeader, TabNav, RevealWrapper                 │
│  ├── ProductIcons（SVG 库，无需框架绑定，仅改 import 路径）            │
│  ├── BaseModal（第一个使用 composables 的组件，作为模板）              │
│  └── 为每个组件写 .test.js（共 6 个测试文件）                          │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 5: 布局组件               8h                                    │
│  ├── NavBar（最复杂的布局组件：mega-menu、搜索栏、语言切换、主题切换） │
│  ├── NavDropdown + MobileMenu（ESC、focus trap、accordion）            │
│  └── Footer                                                            │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 6: Section 组件          16h                                    │
│  ├── HeroSection（LCP 关键路径 — 优先测试）                            │
│  ├── BrandScrollSection（CSS marquee，几乎纯样式）                     │
│  ├── StatsSection（useCountUp）                                        │
│  ├── ProductMatrixSection（useTabs + ProductCard）                     │
│  ├── AiFamilySection（glassmorphism）                                  │
│  ├── IndustrySolutionSection（useTabs + ProductScreenshot）            │
│  ├── TestimonialSection（useCarousel + TestimonialCard）               │
│  ├── LogoWallSection（filter state）                                   │
│  ├── WhyUsSection（dark theme + useTabs + MetricCard）                 │
│  ├── ResourceSection                                                   │
│  └── CtaBannerSection                                                  │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 7: 复杂弹窗              12h                                    │
│  ├── DemoModal + Step1/2/3/Success（多步表单 + 倒计时 + 验证）         │
│  ├── VideoModal（iframe 生命周期管理）                                 │
│  ├── SearchModal（键盘导航 + 高亮 + 分组）                             │
│  ├── ContactModal（信息展示）                                          │
│  └── ChatBot（342 行，最复杂：关键词匹配、typing、quick replies）      │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 8: 页面与入口组装         4h                                    │
│  ├── HomePage.vue（defineAsyncComponent 懒加载 10 个 section）         │
│  ├── App.vue（provider 层级 + 全局 observer + 错误捕获）               │
│  ├── main.js（createApp + mount）                                      │
│  └── scripts/prerender.js 验证（确保 dist 结构不变）                   │
├────────────────────────────────────────────────────────────────────────┤
│  PHASE 9: 测试与构建验证        16h                                    │
│  ├── 补全所有组件测试（目标 ≥ 78 tests，≥ 16 files）                   │
│  ├── `npm run build` 通过                                              │
│  ├── `node scripts/prerender.js` 通过                                  │
│  ├── Lighthouse ≥ 90（Performance + Accessibility）                    │
│  ├── 4 断点响应式视觉检查（375/768/1280/1440）                         │
│  ├── 键盘无障碍测试（Tab / Enter / Esc / ↑↓）                          │
│  └── 包体积对比（dist/assets 总大小 ≤ React 基线 +10%）               │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 日历估算

| 周次 | 阶段 | 交付物 |
|------|------|--------|
| **Week 1** | Phase 0–3 | 工具链就绪；所有 composables 和 stores 完成且测试通过；`npm run dev` 可渲染空白 App.vue |
| **Week 2** | Phase 4–7 | 所有原子组件、布局、sections、弹窗完成；视觉还原度 ≥ 95% |
| **Week 3** | Phase 8–9 | App 组装完成；全部测试通过；Lighthouse ≥ 90；PO 验收 |

---

## 5. 风险评估与缓解

### 5.1 高风险项

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| **ChatBot 状态迁移** | 高 | 高 | 342 行最复杂组件；先写组件测试再迁移；手动 QA 所有对话流 |
| **Search 键盘导航** | 中 | 高 | 算法 verbatim 迁移；单独测试 ArrowUp/Down/Enter/Esc |
| **Focus Trap a11y** | 中 | 高 | 迁移后用 NVDA/VoiceOver 实测；键盘-only 走通全站 |
| **Hero LCP 退化** | 低 | 高 | 优先迁移 HeroSection；Lighthouse 对比基线；动画保持 requestAnimationFrame |
| **i18n 插值行为差异** | 低 | 中 | 保留自定义 `interpolate()` composable，不切换 vue-i18n |
| **CSS Module 类名变更** | 低 | 中 | Vite 对 `.module.css` 的处理框架无关；保持文件命名 |
| **Prerender 脚本中断** | 低 | 高 | 确保 `dist/index.html` 输出结构与 React 版一致 |
| **PWA manifest/service worker** | 低 | 中 | `vite-plugin-pwa` 框架无关；验证 main.js 中注册逻辑 |

### 5.2 框架行为差异对照

| React 模式 | Vue 3 等价 | 陷阱 |
|------------|-----------|------|
| `useRef(null)` DOM | `ref(null)` + `shallowRef` | DOM ref 不需要深度响应，用 `shallowRef` 避免开销 |
| `useEffect(() => {}, [dep])` | `watch(dep, fn)` | Vue `watch` 默认懒执行；需 `{ immediate: true }` 匹配首次执行 |
| `useEffect` cleanup | `onUnmounted` / `watch` 返回 stop | 在 Vue 中 cleanup 逻辑更分散，注意配对 |
| `lazy + Suspense` | `defineAsyncComponent + Suspense` | Vue Suspense 目前**仅支持单根**异步组件；多组件需分别包裹或用一个 shell 组件 |
| `createPortal` | `<Teleport>` | Teleport 目标需在 mount 时存在于 DOM；modals 用 `to="body"` 安全 |
| `<ErrorBoundary>` | `onErrorCaptured` | Vue 没有 per-component 错误边界；在 App.vue 或各 section wrapper 使用 |
| `useMemo` | `computed` | `computed` 自动追踪依赖，无需手动声明；但不可在 `computed` 中修改其他响应式状态 |

---

## 6. 回滚与分支策略

### 6.1 Git 分支

```
main (React 18 — 生产环境)
│
├─ tag: v2.3.4-react-final   ← 不可变基线
│
└─ feat/vue3-migration       ← 所有迁移工作
    │
    ├─ phase-0-tooling
    ├─ phase-1-leaves
    ├─ phase-2-composables
    ├─ phase-3-stores
    ├─ phase-4-ui-atoms
    ├─ phase-5-layout
    ├─ phase-6-sections
    ├─ phase-7-modals
    ├─ phase-8-app-entry
    └─ phase-9-test-build
```

**规则**:
- 每阶段一个 PR → `feat/vue3-migration`，squash-merge
- `main` 始终保持可部署，直到最终合并
- 发现严重问题 → `git revert` 合并提交 或 切回 `v2.3.4-react-final`

### 6.2 回滚场景

| 场景 | 操作 | 恢复时间 |
|------|------|----------|
| 功能分支发现严重 bug | 废弃分支，在 main 修复 | 即时 |
| 合并后 24h 内发现回归 | `git revert <merge-commit>` | 5 分钟 |
| 合并后 48h+ 发现 | cherry-pick 内容修复回 React tag；revert merge | 1–2 小时 |

---

## 7. 验证清单（30 项）

### 7.1 功能 QA（20 项）

| # | 功能 | 验证步骤 | 通过标准 |
|---|------|----------|----------|
| 1 | Hero 首屏 | 加载页面 | LCP < 2.5s；渐变正常；CTA 可见 |
| 2 | 主题切换 | 点击切换按钮 | `data-theme` 切换；localStorage 持久化 |
| 3 | 语言切换 | zh → en → zh-TW | 标题更新；`html lang` 更新；hreflang 正确 |
| 4 | NavBar 滚动 | 滚动 > 60px | 毛玻璃背景出现；> 500px 显示返回顶部 |
| 5 | 移动端菜单 | 375px；点击汉堡 | 菜单展开；accordion 展开；点击外部关闭 |
| 6 | 桌面下拉 | Hover "AI Family" | Mega menu 展开；banner 图片加载 |
| 7 | 产品标签 | Product Matrix 4 个 tab | 面板切换；active 样式更新；无 CLS |
| 8 | 行业标签 | Industry 5 个 tab | 截图 + feature list 随 tab 更新 |
| 9 | WhyUs 标签 | 3 个 tab | Metric 卡片切换动画 |
| 10 | 数字动画 | 滚动到 Stats | 数字从 0 动画；只执行一次 |
| 11 | 客户轮播 | 等待 / 点击箭头 / hover | 自动播放；箭头可用；hover 暂停；resize 重算 |
| 12 | Logo 筛选 | 点击筛选按钮 | 网格过滤；"全部" 恢复 |
| 13 | 滚动显现 | 滚动各 section | `.reveal` 元素淡入；stagger delay 生效 |
| 14 | 全局搜索 | Cmd+K；输入 "AI 面试" | 弹窗打开；结果按类型分组；↑↓ 导航；Enter 跳转 |
| 15 | 演示预约 | 点击"预约演示"；填表 | 步骤推进；验证生效；success 状态；自动关闭 |
| 16 | 视频弹窗 | 点击"观看视频" | 弹窗打开；iframe 加载；关闭停止播放；ESC 关闭 |
| 17 | 联系弹窗 | 点击 FloatingBar 电话 | 弹窗打开；tel: 链接可用 |
| 18 | 智能客服 | 打开 chat；发送 "招聘" | Bot 回复；快捷回复可点击；转人工；typing 指示器 |
| 19 | 浮动按钮 | 滚动到底部 | 按钮可见；< 768px 切换为水平布局 |
| 20 | 页脚链接 | 点击各列 | 外部链接新开标签 |

### 7.2 技术检查（10 项）

| # | 检查项 | 方法 |
|---|--------|------|
| 21 | 构建成功 | `npm run build` exit 0 |
| 22 | 预渲染成功 | `node scripts/prerender.js` 无报错 |
| 23 | PWA manifest 有效 | DevTools → Application → Manifest 正确显示 |
| 24 | 控制台无报错 | 加载和交互后 console 清空 |
| 25 | Lighthouse ≥ 90 | Performance ≥ 90, Accessibility ≥ 95 |
| 26 | 4 断点响应式 | 375/768/1280/1440 无横向滚动、无文字重叠 |
| 27 | 纯键盘导航 | Tab 走完全页；所有交互元素可达；focus 可见 |
| 28 | 屏幕阅读器 | NVDA/VoiceOver 读取弹窗标题、按钮标签、章节标题 |
| 29 | 包体积 ≤ 基线+10% | `dist/assets/` 总大小对比 |
| 30 | 全部测试通过 | `npm run test:run` 78+/78+ |

---

## 8. 迁移后优化机会（Out of Scope）

以下项 **不在本次迁移范围内**，作为后续版本 backlog：

1. **Vue I18n 集成** — 替换自定义 interpolate，支持 ICU 复数
2. **TypeScript 迁移** — 为 SFC 添加 `lang="ts"`
3. **UnoCSS / Tailwind** — 替换 CSS Modules，消除 ~30 个 `.module.css` 文件
4. **Nuxt 3 迁移** — 若需 SSR 或多页面，Nuxt static generation 是自然选择
5. **组件库提取** — 第二页构建时，将 Button/Tag/BaseModal 等提取为私有包

---

## 9. 文件清单对照

| 目录 | React 文件数 | Vue 文件数 | 变更说明 |
|------|-------------|-----------|----------|
| `src/` (entry) | 2 (App.jsx, main.jsx) | 2 (App.vue, main.js) | 完全重写 |
| `composables/` (原 hooks/) | 12 | 12 | 语义等价迁移 |
| `stores/` (原 context/) | 3 | 5 | 拆分为独立 store 文件 |
| `components/ui/` | 18 | 18 | JSX → SFC |
| `components/layout/` | 3 | 3 | JSX → SFC |
| `components/sections/` | 22 | 22 | JSX → SFC |
| `components/icons/` | 3 | 3 | 仅改 import |
| `pages/` | 1 | 1 | JSX → SFC |
| `data/` | 9 | 9 | **0 改动** |
| `tokens/` | 1 | 1 | **0 改动** |
| `styles/` | 3 | 3 | **0 改动** |
| `i18n/` | 4 | 3 (去掉 .jsx) | 逻辑提取到 stores/ |
| **总计** | **~50** | **~50** | 仅框架绑定层变更 |

---

## 10. 下一步行动

1. **用户确认方案** → 批准后开始 Phase 0
2. **创建 `feat/vue3-migration` 分支**
3. **Phase 0**: 安装 Vue 3 依赖，验证 dev server 正常
4. **按 Phase 1–9 顺序执行**，每阶段完成后更新本计划文档的进度

> **底线**: 若迁移过程中发现任何无法通过测试捕获的回归（特别是视觉或 a11y），立即停止当前 Phase，评估是否需要回滚到 React 基线。
