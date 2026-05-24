# TalentPro HR Portal — 测试计划

> **版本**：v0.1.0（待测试 Agent 填充）
> **负责角色**：测试专家 Agent

---

## 测试范围

### 功能测试项（按 Section）

| Section | 测试要点 | 优先级 |
|---------|---------|-------|
| SEC-01 导航 | Mega 菜单展开/收起、滚动变色、移动端 Hamburger | P0 |
| SEC-02 Hero | CTA 按钮触发弹窗、视频按钮（待实现）| P0 |
| SEC-04 统计区 | Count-up 动画触发 | P1 |
| SEC-05 产品矩阵 | 4 Tab 切换正确 | P0 |
| SEC-06 AI 专区 | 卡片 hover 效果 | P1 |
| SEC-07 行业方案 | 5 Tab 切换 + 内容联动 | P0 |
| SEC-08 轮播 | 自动播放、手动切换、悬停暂停、resize 正确 | P0 |
| SEC-09 Logo 墙 | 行业筛选过滤功能 | P0 |
| SEC-10 为什么选我们 | 3 Tab 切换 | P0 |
| SEC-15 弹窗 | 3 步骤流程、表单验证、验证码倒计时 | P0 |

### 响应式测试断点

| 断点 | 宽度 | 测试设备 |
|------|------|---------|
| Mobile S | 375px | iPhone SE |
| Tablet | 768px | iPad |
| Desktop S | 1024px | 小屏笔记本 |
| Desktop | 1440px | 标准桌面 |

### 跨浏览器测试

- Chrome 最新版
- Safari 最新版
- Firefox 最新版
- Edge 最新版

---

## 测试用例

> 待测试 Agent 基于上述范围编写详细用例（`test-cases.md`）

---

## 缺陷报告模板

```markdown
## Bug Report

**ID**：BUG-XXX
**发现版本**：vX.X.X
**严重程度**：P0 / P1 / P2
**复现概率**：必现 / 偶现
**复现步骤**：
1.
2.
**预期结果**：
**实际结果**：
**截图/录屏**：
```
