# P2 性能评估报告 — 数据文件按需加载

> 评估日期: 2026-06-09
> 评估范围: `src/data/products.js`, `src/data/industries.js`, `src/data/cases.js`, `src/data/resources.js`

---

## 当前数据文件体积

| 文件 | 原始大小 | gzip 估算 | 使用页面 |
|------|---------|----------|---------|
| `products.js` | 36.7 KB | ~9 KB | `/products`, `/products/:slug` |
| `industries.js` | 23.2 KB | ~6 KB | `/solutions`, `/solutions/:slug` |
| `cases.js` | 11.7 KB | ~3 KB | `/cases`, `/cases/:slug` |
| `resources.js` | 14.1 KB | ~4 KB | `/resources`, `/resources/:slug` |
| **合计** | **85.7 KB** | **~22 KB** | — |

---

## 分析结论

### 1. 当前体积在可接受范围内 ✅

- 22 KB gzip 总量远低于性能目标（vendor < 150KB, app < 80KB）
- 现代网络环境下，22 KB 的额外 JS 加载对 LCP 影响 < 100ms
- 这些数据文件是**首屏关键资源**：产品矩阵和行业方案是首页主要内容

### 2. 真正的优化点：详情字段与列表字段混装

`products.js` 中每个产品包含了 `features` / `scenarios` / `testimonial` / `specs` / `related` 等**仅详情页使用**的字段，导致：

- `/products` 列表页加载了 36.7 KB 中约 **60% 不需要的数据**
- `/solutions` 列表页加载了 23.2 KB 中约 **55% 不需要的数据**

### 3. 建议方案：基础数据 + 详情数据分离

```
src/data/
├── products.js          # 列表页数据：name/tagline/desc/icon（~15 KB）
├── productDetails.js    # 详情页数据：features/scenarios/testimonial/specs/related（~22 KB）
├── industries.js        # 列表页数据：label/heroTitle/heroDesc/icon/stats（~10 KB）
└── industryDetails.js   # 详情页数据：painPoints/architecture/roadmap/caseStudy/roi（~13 KB）
```

实现方式：

```js
// products/[slug].vue
const { data: product } = useAsyncData(
  `product-${slug}`,
  async () => {
    const base = PRODUCT_MAP[slug];
    if (!base) return null;
    // 仅详情页动态加载详情数据
    const details = await import('@/data/productDetails.js').then(m => m.PRODUCT_DETAILS[slug]);
    return { ...base, ...details };
  },
  { server: false }
);
```

收益预估：
- `/products` 首屏减少 ~22 KB JS 解析执行
- `/solutions` 首屏减少 ~13 KB JS 解析执行
- 详情页首次访问增加 1 个 HTTP 请求（可预加载）

### 4. 立即可做的低 hanging fruit

1. **cases.js / resources.js**：体积已较小（< 15 KB），无需拆分
2. **SVG 占位图优化**：当前 cases.js 中内联了 8 个 SVG data URI（~8 KB），可改为 CSS 渐变类，减少 ~6 KB
3. **Tree-shaking 验证**：确保 `searchIndex.js` 中没有引入未使用的详情字段

### 5. 决策建议

| 优先级 | 行动 | 工作量 | 收益 |
|-------|------|-------|------|
| P2 | products.js / industries.js 详情拆分 | 2h | 中（-35 KB 列表页） |
| P2 | cases.js SVG 占位符改为 CSS | 30min | 低（-6 KB） |
| P3 | 动态 import 预加载策略 | 1h | 中（详情页 0ms 延迟） |

**结论**：当前数据文件体积不构成性能瓶颈，但详情/列表数据混装是合理的优化点。建议在下一个专注性能的 Sprint 中实施拆分。
