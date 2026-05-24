# Sprint 8 计划 — 页脚完善 + Hero 视觉增强

> **状态**：📋 待 Sprint 7 完成并验收后执行
> **目标**：页脚信息补全（二维码 + 社交图标）+ Hero 视觉层次感提升
> **涉及模块**：Footer（SEC-13）/ HeroSection（SEC-02）
> **Token 预算**：输入 ≈ 14,000 / 输出 ≈ 7,000（✅ 在预算内）

---

## 任务清单

| ID | 模块 | 任务 | 类型 | 优先级 | 最小化变更范围 | 状态 |
|----|------|------|------|-------|-------------|------|
| T8-01 | SEC-13 | Footer 品牌列底部追加二维码占位区（2个 80×80px SVG + 标签文字）| Feature | P1 | 仅在品牌列末尾追加 | Todo |
| T8-02 | SEC-13 | Footer 追加社交图标行（知乎 + 微博 SVG，32×32px 容器，hover 变主色）| Feature | P1 | 仅在联系区后追加 | Todo |
| T8-03 | SEC-02 | HeroSection 新增 3 个浮动装饰圆（绝对定位，pointer-events: none）| Visual | P1 | 新增 3 个 div + CSS | Todo |
| T8-04 | SEC-02 | Hero Dashboard 外发光增强（filter drop-shadow 值更新）| Visual | P1 | 改 `.visual` filter 属性（1行）| Todo |
| T8-05 | SEC-02 | Hero 信任点竖线分隔样式 | Visual | P1 | 改 `.trust` 和 `.trustItem` CSS（3-4行）| Todo |

---

## 技术规格

### T8-01/02 Footer 二维码区

```jsx
// 在 Footer.jsx 品牌列，footer-contact 下方追加：
<div className={styles.qrSection}>
  <div className={styles.qrItem}>
    <QrPlaceholder />          {/* 80×80px SVG 点阵占位 */}
    <span>官方公众号</span>
  </div>
  <div className={styles.qrItem}>
    <QrPlaceholder />
    <span>视频号</span>
  </div>
</div>
<div className={styles.socialRow}>
  <a href="#" className={styles.socialIcon} aria-label="知乎"><ZhihuIcon /></a>
  <a href="#" className={styles.socialIcon} aria-label="微博"><WeiboIcon /></a>
</div>
```

### T8-03 Hero 装饰圆

```jsx
// 在 HeroSection.jsx bgGlowAi 之后追加：
<div className={`${styles.deco} ${styles.decoA}`} aria-hidden="true" />
<div className={`${styles.deco} ${styles.decoB}`} aria-hidden="true" />
<div className={`${styles.deco} ${styles.decoC}`} aria-hidden="true" />
```

```css
/* HeroSection.module.css 新增 */
.deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.decoA { width: 300px; height: 300px; top: 15%; left: -5%;  background: rgba(27,95,235,0.08);  animation: float 8s ease-in-out infinite; }
.decoB { width: 200px; height: 200px; top: 60%; right: 5%;  background: rgba(124,58,237,0.06); animation: float 12s ease-in-out infinite reverse; }
.decoC { width: 150px; height: 150px; top: 30%; right: 30%; background: rgba(27,95,235,0.05);  animation: float 10s ease-in-out 2s infinite; }

@media (max-width: 767px) {
  .decoA, .decoB, .decoC { display: none; }
}
```

---

## 验收标准

- [ ] Footer：2 个二维码占位图可见，标签文字清晰
- [ ] Footer：知乎/微博图标正常，hover 背景变蓝
- [ ] Footer：Mobile 正常堆叠，无布局破坏
- [ ] Hero：3 个装饰圆以不同速度漂浮，视觉层次感提升
- [ ] Hero：装饰圆不遮挡标题、副标题、CTA 按钮、Dashboard
- [ ] Hero：Mobile（375px）装饰圆不显示
- [ ] Hero：CTA 按钮仍可正常触发弹窗
- [ ] 仅 SEC-02 和 SEC-13 有视觉变化，其他 Section 无回归

## 预览计划

Sprint 8 完成后，PO 验收：
1. 桌面 1440px：页脚二维码区 + 社交图标
2. 桌面 1440px：Hero 区域对比 v2.0.0 的视觉层次变化
3. 移动端 375px：页脚堆叠 + Hero 装饰圆隐藏
