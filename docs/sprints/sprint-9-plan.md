# Sprint 9 计划 — Logo 墙图形化 + 安全认证徽章区

> **状态**：📋 待 PO 确认「Sprint 9 开始」后执行
> **目标**：Logo 墙视觉专业化 + 企业安全信任背书强化
> **涉及模块**：LogoWallSection（SEC-09）/ WhyUsSection（SEC-10）
> **Token 预算**：输入 ≈ 15,000 / 输出 ≈ 9,000（✅ 在预算内）

---

## 任务清单

| ID | 任务 | 优先级 | 最小化变更范围 | 状态 |
|----|------|-------|-------------|------|
| T9-01a | 更新 `logos.js`：每条数据追加 `brandColor`（品牌色）和 `initial`（首字母）字段 | P2 | 仅在已有字段后追加 2 个字段 | Todo |
| T9-01b | 更新 `LogoWallSection.jsx`：`itemInner` 中替换为品牌色首字母圆形渲染 | P2 | 仅改 itemInner 内的渲染逻辑（≤ 8 行）| Todo |
| T9-01c | 更新 `LogoWallSection.module.css`：新增 `.logoCircle` / `.logoInitial`；`.item` 默认灰度，hover 还原彩色 | P2 | 追加 ~30 行 CSS，不改已有 class | Todo |
| T9-02a | 新建 `src/data/security.js`：6 个安全认证数据 | P2 | 仅新建文件 | Todo |
| T9-02b | 更新 `WhyUsSection.jsx`：在 `statsBar` 下方追加 `<SecurityBadges />` 内联组件 | P2 | 仅在 JSX 末尾追加（≤ 15 行）| Todo |
| T9-02c | 更新 `WhyUsSection.module.css`：新增 `.certSection` / `.certBadge` 等样式 | P2 | 追加 ~40 行 CSS | Todo |

---

## 技术规格摘要

### Logo 图形化

```jsx
// LogoWallSection.jsx — itemInner 替换为：
<div
  className={styles.logoCircle}
  style={{ '--brand': item.brandColor }}
>
  <span className={styles.logoInitial}>{item.initial}</span>
</div>
<span className={styles.name}>{item.name}</span>
```

```css
/* LogoWallSection.module.css 新增 */

/* 默认灰度，hover 还原品牌色 */
.item { filter: grayscale(1) opacity(0.65); }
.item:hover { filter: none; }

.logoCircle {
  width: 36px; height: 36px; border-radius: 50%;
  background: color-mix(in srgb, var(--brand) 15%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--brand) 30%, transparent);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.3s;
}
.item:hover .logoCircle {
  border-color: color-mix(in srgb, var(--brand) 60%, transparent);
}

.logoInitial {
  font-size: 13px; font-weight: 900;
  color: var(--brand);
  line-height: 1;
}
```

> 兼容性注意：`color-mix()` 在现代浏览器支持良好（Chrome 111+/Safari 16.2+）。如需兼容旧版，可直接用 `rgba` 内联样式替代。

### 安全认证徽章区

```jsx
// WhyUsSection.jsx 末尾追加（SecurityBadges 内联组件）
function SecurityBadges() {
  return (
    <div className={styles.certSection}>
      <div className={styles.certTitle}>数据安全 · 合规认证</div>
      <div className={styles.certList}>
        {SECURITY_CERTS.map(cert => (
          <div key={cert.id} className={styles.certBadge}>
            <span className={styles.certIcon}>{cert.icon}</span>
            <span className={styles.certLabel}>{cert.label}</span>
            <span className={styles.certDesc}>{cert.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 验收标准

- [ ] 18 个 Logo 默认灰度，鼠标悬停变品牌彩色
- [ ] 灰度 → 彩色过渡流畅（0.3s）
- [ ] 行业筛选功能完全保留（筛选 + 隐藏动画）
- [ ] 6 个安全认证徽章显示在 WhyUs 区底部统计条下方
- [ ] 徽章 hover 有轻微背景变化
- [ ] Mobile：徽章描述（`.certDesc`）隐藏，仅显示图标 + 标签
- [ ] 未影响 WhyUs 的 Tab 切换和 count-up 动画

## 预览计划

Sprint 9 完成后，PO 验收：
1. Logo 墙：默认灰度 → hover 变彩色（对比每个行业的品牌色）
2. 行业筛选：点击「互联网」等仍正常过滤
3. 为什么选我们：滚动到底部，安全认证 6 个徽章可见
4. Mobile 375px：徽章简化版显示
