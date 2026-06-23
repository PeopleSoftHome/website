/**
 * useStepModal — 通用多步骤弹窗状态机
 * 支持打开/关闭、步骤前进、表单数据共享、提交状态管理。
 */
import { ref, onUnmounted } from 'vue';

export interface UseStepModalOptions<T> {
  steps: number;
  initialData: T;
  closeDelay?: number;
  resetDelay?: number;
}

export function useStepModal<T extends Record<string, unknown>>(options: UseStepModalOptions<T>) {
  const { steps, initialData, closeDelay = 0, resetDelay = 350 } = options;

  const isOpen = ref(false);
  const step = ref(0);
  const isSuccess = ref(false);
  const isSubmitting = ref(false);
  const submitError = ref('');
  const formData = ref<T>({ ...initialData });

  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const resetState = () => {
    step.value = 0;
    isSuccess.value = false;
    submitError.value = '';
    formData.value = { ...initialData };
  };

  const closeModal = () => {
    clearTimers();
    isOpen.value = false;
    timer = setTimeout(resetState, resetDelay);
  };

  const openModal = () => {
    clearTimers();
    isOpen.value = true;
  };

  const nextStep = () => { step.value = Math.min(step.value + 1, steps - 1); };
  const prevStep = () => { step.value = Math.max(step.value - 1, 0); };
  const goToStep = (s: number) => { step.value = Math.min(Math.max(s, 0), steps - 1); };

  const setSubmitting = (value: boolean) => { isSubmitting.value = value; };
  const setSuccess = (value: boolean) => { isSuccess.value = value; };
  const setError = (message: string) => { submitError.value = message; };

  const markSuccessAndClose = (delay = 2500) => {
    isSuccess.value = true;
    timer = setTimeout(closeModal, delay);
  };

  onUnmounted(clearTimers);

  return {
    isOpen, step, isSuccess, isSubmitting, submitError, formData,
    openModal, closeModal, nextStep, prevStep, goToStep,
    setSubmitting, setSuccess, setError, markSuccessAndClose,
  };
}
