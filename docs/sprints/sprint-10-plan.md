# Sprint 10 计划 — Hero 视频弹窗（GA 发布冲刺）

> **状态**：📋 待 Sprint 9 完成并验收后执行
> **目标**：Hero「▶ 观看产品演示」接入视频弹窗，完成 v2.2.0 GA 版本
> **涉及模块**：新建 VideoModal / 新建 useVideoModal / 更新 HeroSection + App
> **Token 预算**：输入 ≈ 14,000 / 输出 ≈ 7,500（✅ 在预算内）

---

## 任务清单

| ID | 任务 | 优先级 | 最小化变更范围 | 状态 |
|----|------|-------|-------------|------|
| T10-01 | 新建 `src/hooks/useVideoModal.js` | P2 | 仅新建文件（参考 useModal.js）| Todo |
| T10-02 | 新建 `src/context/VideoModalContext.js` | P2 | 仅新建文件（参考 ModalContext.js）| Todo |
| T10-03 | 新建 `src/components/ui/VideoModal/VideoModal.jsx` + `VideoModal.module.css` | P2 | 仅新建目录 | Todo |
| T10-04 | 更新 `HeroSection.jsx`：给 `.ctaGhost` 按钮绑定 `openVideo()` | P2 | 追加 2 行（import + onClick）| Todo |
| T10-05 | 更新 `App.jsx`：新增 `VideoModalContext.Provider` + `<VideoModal />` | P2 | 追加 2 import + 2 行 JSX | Todo |

---

## 技术规格

### useVideoModal.js

```js
import { useState, useCallback, useEffect } from 'react';

export function useVideoModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openVideo  = useCallback(() => setIsOpen(true),  []);
  const closeVideo = useCallback(() => setIsOpen(false), []);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === 'Escape') closeVideo(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, closeVideo]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return { isOpen, openVideo, closeVideo };
}
```

### VideoModal.jsx 核心逻辑

```jsx
import { useRef, useCallback } from 'react';
import { useVideoModalContext } from '../../../context/VideoModalContext';
import styles from './VideoModal.module.css';

const VIDEO_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0';

export default function VideoModal() {
  const { isOpen, closeVideo } = useVideoModalContext();
  const iframeRef = useRef(null);

  // 关闭时暂停视频（重置 src）
  const handleClose = useCallback(() => {
    if (iframeRef.current) iframeRef.current.src = '';
    setTimeout(closeVideo, 50);
  }, [closeVideo]);

  if (!isOpen) return null;  // 未打开时不渲染（避免预加载）

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="产品演示视频"
    >
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="关闭">✕</button>
        <div className={styles.videoWrap}>
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            src={`${VIDEO_URL}&autoplay=1`}
            title="TalentPro 产品演示"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
```

### App.jsx 变更（最小化）

```jsx
// 追加 2 个 import
import { VideoModalContext } from './context/VideoModalContext';
import { useVideoModal }     from './hooks/useVideoModal';
import VideoModal            from './components/ui/VideoModal/VideoModal';

export default function App() {
  const modal      = useModal();
  const videoModal = useVideoModal();  // 新增

  return (
    <ModalContext.Provider value={modal}>
      <VideoModalContext.Provider value={videoModal}>  {/* 新增 */}
        <NavBar />
        <main><HomePage /></main>
        <Footer />
        <FloatingBar />
        <DemoModal />
        <VideoModal />  {/* 新增 */}
      </VideoModalContext.Provider>
    </ModalContext.Provider>
  );
}
```

### z-index 层级确认

| 层级 | 值 | 组件 |
|------|-----|------|
| 导航栏 | 1000 | NavBar |
| 移动端菜单 | 999 | MobileMenu |
| 浮动按钮 | 999 | FloatingBar |
| 预约弹窗 | 2000 | DemoModal |
| **视频弹窗** | **3000** | **VideoModal** |

---

## GA 版本完成清单

Sprint 10 完成后，执行全量回归验收：

### 功能验收
- [ ] 15 个 Section 全部正常渲染
- [ ] Hero 视频弹窗：打开/关闭/暂停/ESC/遮罩关闭
- [ ] DemoModal 无回归（z-index 不冲突）
- [ ] Logo 墙：筛选 + 灰度→彩色
- [ ] 安全认证徽章：显示正常
- [ ] 轮播：resize + 悬停暂停

### 响应式验收
- [ ] 375px（iPhone SE）全页面无横向溢出
- [ ] 768px（iPad）关键断点
- [ ] 1440px（MacBook Pro）标准布局

### 性能验收（Lighthouse）
- [ ] Performance ≥ 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

## 预览计划

Sprint 10 完成后，PO 验收：
1. 桌面：点击 Hero「▶ 观看产品演示」→ 视频弹窗弹出，视频自动播放
2. 遮罩点击/✕按钮/ESC → 视频停止，弹窗关闭
3. Mobile 375px：视频弹窗全宽显示，关闭按钮可触碰
4. 同时触发 DemoModal：确认两个弹窗 z-index 无冲突
