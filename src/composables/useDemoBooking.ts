/**
 * useDemoBooking — 预约演示弹窗业务逻辑
 * 基于 useStepModal + leadApi + reCAPTCHA 的专用业务封装。
 */
import { leadApi } from '@/api/lead';
import { usePublicConfig } from '@/composables/usePublicConfig';
import { useStepModal } from '@/composables/useStepModal';

export interface DemoFormData {
  name: string;
  company: string;
  phone: string;
  code: string;
  products: string[];
  scale: string;
  [key: string]: unknown;
}

const INITIAL_FORM_DATA: DemoFormData = {
  name: '',
  company: '',
  phone: '',
  code: '',
  products: [],
  scale: '',
};

export function useDemoBooking() {
  const { recaptchaSiteKey } = usePublicConfig();

  const modal = useStepModal<DemoFormData>({
    steps: 3,
    initialData: { ...INITIAL_FORM_DATA },
  });

  const submitForm = async () => {
    modal.setSubmitting(true);
    modal.setError('');
    try {
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
        name: modal.formData.value.name,
        company: modal.formData.value.company,
        phone: modal.formData.value.phone,
        products: modal.formData.value.products,
        scale: modal.formData.value.scale,
        recaptchaToken,
      });
      modal.markSuccessAndClose();
    } catch (e) {
      const err = e as Error;
      modal.setError(err.message || '提交失败，请稍后重试');
    } finally {
      modal.setSubmitting(false);
    }
  };

  return {
    ...modal,
    submitForm,
  };
}
