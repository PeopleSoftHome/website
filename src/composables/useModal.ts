/**
 * useModal — 预约演示弹窗状态机
 * 状态：关闭 → Step0（联系信息）→ Step1（产品选择）→ Step2（企业规模）→ 成功 → 自动关闭
 */
import { ref, onUnmounted } from 'vue';
import { leadApi } from '@/api/lead.js';
import { usePublicConfig } from '@/composables/usePublicConfig.js';

interface DemoFormData {
  name: string;
  company: string;
  phone: string;
  code: string;
  products: string[];
  scale: string;
}

export function useModal() {
  const { recaptchaSiteKey } = usePublicConfig();

  const isOpen = ref(false);
  const step = ref(0);
  const isSuccess = ref(false);
  const isSubmitting = ref(false);
  const submitError = ref('');

  // 表单数据（供各 Step 组件共享写入）
  const formData = ref<DemoFormData>({
    name: '',
    company: '',
    phone: '',
    code: '',
    products: [],
    scale: '',
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

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
      submitError.value = '';
      formData.value = { name: '', company: '', phone: '', code: '', products: [], scale: '' };
    }, 350);
  };

  const openModal = () => {
    clearTimers();
    isOpen.value = true;
  };

  const nextStep = () => { step.value = Math.min(step.value + 1, 2); };

  const submitForm = async () => {
    clearTimers();
    isSubmitting.value = true;
    submitError.value = '';
    try {
      // 获取 reCAPTCHA token（如果配置了）
      let recaptchaToken = '';
      if (recaptchaSiteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(
            recaptchaSiteKey,
            { action: 'demo_booking' },
          );
        } catch {
          // reCAPTCHA 未加载或失败，继续提交（后端会跳过验证）
        }
      }

      await leadApi.createBooking({
        name: formData.value.name,
        company: formData.value.company,
        phone: formData.value.phone,
        products: formData.value.products,
        scale: formData.value.scale,
        recaptchaToken,
      });
      isSuccess.value = true;
      timer = setTimeout(closeModal, 2500);
    } catch (e) {
      const err = e as Error;
      submitError.value = err.message || '提交失败，请稍后重试';
      // 保持在当前步骤，不跳转成功页
    } finally {
      isSubmitting.value = false;
    }
  };

  onUnmounted(clearTimers);

  return {
    isOpen, step, isSuccess, isSubmitting, submitError, formData,
    openModal, closeModal, nextStep, submitForm,
  };
}
