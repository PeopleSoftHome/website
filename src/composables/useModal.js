/**
 * useModal — 预约演示弹窗状态机
 * 状态：关闭 → Step0（联系信息）→ Step1（产品选择）→ Step2（企业规模）→ 成功 → 自动关闭
 */
import { ref, onUnmounted } from 'vue';

export function useModal() {
  const isOpen = ref(false);
  const step = ref(0);
  const isSuccess = ref(false);
  let timer = null;

  const clearTimers = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const closeModal = () => {
    clearTimers();
    isOpen.value = false;
    // 延迟重置，等待关闭动画（350ms）结束后再重置内容
    timer = setTimeout(() => {
      step.value = 0;
      isSuccess.value = false;
    }, 350);
  };

  const openModal = () => {
    clearTimers();
    isOpen.value = true;
  };

  const nextStep = () => { step.value = Math.min(step.value + 1, 2); };

  const submitForm = () => {
    clearTimers();
    isSuccess.value = true;
    timer = setTimeout(closeModal, 2500);
  };

  onUnmounted(clearTimers);

  return { isOpen, step, isSuccess, openModal, closeModal, nextStep, submitForm };
}
