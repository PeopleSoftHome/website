import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useModal — 预约演示弹窗状态机
 * 状态：关闭 → Step0（联系信息）→ Step1（产品选择）→ Step2（企业规模）→ 成功 → 自动关闭
 *
 * v2.3.2 Phase 2：ESC / body scroll lock 已下沉至 BaseModal，本 Hook 仅负责状态机。
 */
export function useModal() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [step,      setStep]      = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const timerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    clearTimers();
    setIsOpen(false);
    // 延迟重置，等待关闭动画（350ms）结束后再重置内容
    timerRef.current = setTimeout(() => {
      setStep(0);
      setIsSuccess(false);
    }, 350);
  }, [clearTimers]);

  const openModal  = useCallback(() => {
    clearTimers();
    setIsOpen(true);
  }, [clearTimers]);

  const nextStep   = useCallback(() => setStep(s => Math.min(s + 1, 2)), []);

  const submitForm = useCallback(() => {
    clearTimers();
    setIsSuccess(true);
    timerRef.current = setTimeout(closeModal, 2500);
  }, [clearTimers, closeModal]);

  // 组件卸载时清理残留 timer
  useEffect(() => () => clearTimers(), [clearTimers]);

  return { isOpen, step, isSuccess, openModal, closeModal, nextStep, submitForm };
}
