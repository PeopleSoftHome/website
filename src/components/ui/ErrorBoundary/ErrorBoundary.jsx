import { Component } from 'react';

/**
 * ErrorBoundary — 错误边界
 *
 * 捕获子组件树中的渲染错误，防止单个组件崩溃导致全站白屏。
 * 包裹在核心区域（HomePage、各弹窗）外使用。
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env?.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
