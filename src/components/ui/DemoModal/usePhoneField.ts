/**
 * usePhoneField — DemoModal 手机号字段逻辑
 * 手机号正则/格式化/微信 Contacts API 自动填入（含 sessionStorage 回退）
 */
import { ref, onMounted } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';

export const PHONE_REG = /^1[3-9]\d{9}$/;

/** 13800000000 → 138 0000 0000 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
}

interface ContactInfo {
  tel?: string[];
}

declare global {
  interface Navigator {
    contacts?: {
      select: (props: string[], options: { multiple: boolean }) => Promise<ContactInfo[]>;
    };
  }
  interface Window {
    ContactsManager?: unknown;
  }
}

export function usePhoneAutofill(options: {
  setPhone: (value: string) => void;
  onFilled: () => void;
}) {
  const canAutoFill = ref(false);

  onMounted(() => {
    canAutoFill.value = 'contacts' in navigator || 'credentials' in navigator;
  });

  const autoFillPhone = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.contacts && 'ContactsManager' in window) {
        const contacts = await navigator.contacts.select(['tel'], { multiple: false });
        const firstContact = contacts[0];
        if (firstContact?.tel && firstContact.tel.length > 0) {
          const raw = (firstContact.tel[0] || '').replace(/\D/g, '');
          if (PHONE_REG.test(raw)) {
            options.setPhone(raw);
            options.onFilled();
            return;
          }
        }
      }
    } catch {
      // 静默失败
    }
    // Fallback：尝试读取已保存的表单数据
    const savedPhone = sessionStorage.getItem(STORAGE_KEYS.DEMO_LAST_PHONE);
    if (savedPhone && PHONE_REG.test(savedPhone)) {
      options.setPhone(savedPhone);
      options.onFilled();
    }
  };

  return { canAutoFill, autoFillPhone };
}
