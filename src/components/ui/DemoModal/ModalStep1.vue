<template>
  <div>
    <div :class="s.stepTitle">{{ t('modal.step1Title') }}</div>
    <div :class="s.stepSub">{{ t('modal.step1Sub') }}</div>

    <!-- 微信一键填入（Progressive Enhancement） -->
    <button
      v-if="canAutoFill"
      type="button"
      :class="s.autoFillBtn"
      @click="autoFillPhone"
    >
      {{ t('modal.autoFillPhone') }}
    </button>

    <div :class="s.formRow">
      <Field :label="t('modal.labelName')" required :error="errors.name">
        <input
          ref="nameRef"
          :class="[s.input, errors.name ? s.inputError : '']"
          name="name" :placeholder="t('modal.phName')"
          v-model="fields.name" @input="clearError('name')"
          @focus="scrollToTop"
          autocomplete="name"
        />
      </Field>
      <Field :label="t('modal.labelCompany')" required :error="errors.company">
        <input
          :class="[s.input, errors.company ? s.inputError : '']"
          name="company" :placeholder="t('modal.phCompany')"
          v-model="fields.company" @input="clearError('company')"
          @focus="scrollToTop"
          autocomplete="organization"
        />
      </Field>
    </div>

    <Field :label="t('modal.labelPhone')" required :error="errors.phone">
      <input
        :class="[s.input, errors.phone ? s.inputError : '']"
        name="phone" :placeholder="t('modal.phPhone')" type="tel" maxlength="13"
        :value="formattedPhone"
        @input="handlePhoneInput"
        @focus="scrollToTop"
        autocomplete="tel"
      />
    </Field>

    <Field :label="t('modal.labelCode')" required :error="errors.code">
      <div :class="s.verifyRow">
        <input
          :class="[s.input, errors.code ? s.inputError : '']"
          name="code" :placeholder="t('modal.phCode')" type="number" maxlength="6"
          v-model="fields.code" @input="clearError('code')"
          @focus="scrollToTop"
        />
        <button :class="s.verifyBtn" @click="sendCode" :disabled="countdown > 0">
          {{ countdown > 0 ? t('modal.resend', { n: countdown }) : t('modal.sendCode') }}
        </button>
      </div>
    </Field>

    <!-- 服务条款复选框 -->
    <div :class="s.tosRow">
      <label :class="s.tosLabel">
        <input
          type="checkbox"
          v-model="fields.agreed"
          :class="s.tosCheck"
        />
        <span :class="s.tosText">
          {{ t('modal.tosPrefix') }}
          <a href="#" target="_blank" @click.prevent>{{ t('modal.tosLink') }}</a>
          {{ t('modal.tosSuffix') }}
        </span>
      </label>
      <span v-if="errors.tos" :class="s.errorMsg">{{ errors.tos }}</span>
    </div>

    <button :class="s.submitBtn" @click="handleNext">{{ t('modal.next') }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, h, watch, computed, onMounted } from 'vue';
import type { SetupContext } from 'vue';
import { useModalStore } from '@/stores/modal.pinia.js';
import s from './DemoModal.module.css';

const PHONE_REG = /^1[3-9]\d{9}$/;

const { t } = useI18n();
const modalStore = useModalStore();
const emit = defineEmits(['next']);

interface FormFields {
  name: string;
  company: string;
  phone: string;
  code: string;
  agreed: boolean;
}

interface FormErrors {
  name?: string;
  company?: string;
  phone?: string;
  code?: string;
  tos?: string;
}

const fields = reactive<FormFields>({ name: '', company: '', phone: '', code: '', agreed: false });
const errors = reactive<FormErrors>({});
const countdown = ref(0);
let timer: ReturnType<typeof setTimeout> | null = null;
const nameRef = ref<HTMLInputElement | null>(null);

// 同步到 store
watch(fields, (val) => {
  modalStore.formData.name = val.name;
  modalStore.formData.company = val.company;
  modalStore.formData.phone = val.phone;
  modalStore.formData.code = val.code;
}, { deep: true });

/* ── 手机号格式化：13800000000 → 138 0000 0000 ── */
const formattedPhone = computed(() => {
  const raw = fields.phone.replace(/\D/g, '');
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 3)} ${raw.slice(3)}`;
  return `${raw.slice(0, 3)} ${raw.slice(3, 7)} ${raw.slice(7, 11)}`;
});

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '').slice(0, 11);
  fields.phone = raw;
  clearError('phone');
};

/* ── 聚焦时滚动到顶部（解决移动端键盘遮挡）── */
const scrollToTop = () => {
  const modal = document.querySelector(`.${s.modal}`);
  if (modal) {
    modal.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/* ── 微信/浏览器手机号自动填入 ── */
const canAutoFill = ref(false);
onMounted(() => {
  canAutoFill.value = 'contacts' in navigator || 'credentials' in navigator;
});

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

const autoFillPhone = async () => {
  try {
    if (navigator.contacts && 'ContactsManager' in window) {
      const props = ['tel'];
      const contacts = await navigator.contacts.select(props, { multiple: false });
      const firstContact = contacts[0];
      if (firstContact?.tel && firstContact.tel.length > 0) {
        const raw = (firstContact.tel[0] || '').replace(/\D/g, '');
        if (PHONE_REG.test(raw)) {
          fields.phone = raw;
          clearError('phone');
          return;
        }
      }
    }
  } catch {
    // 静默失败
  }
  // Fallback：尝试读取已保存的表单数据
  const savedPhone = sessionStorage.getItem('tp_last_phone');
  if (savedPhone && PHONE_REG.test(savedPhone)) {
    fields.phone = savedPhone;
    clearError('phone');
  }
};

onUnmounted(() => {
  if (timer) { clearInterval(timer); timer = null; }
});

const clearError = (key: keyof FormErrors) => {
  if (errors[key]) delete errors[key];
};

const sendCode = () => {
  if (!PHONE_REG.test(fields.phone)) {
    errors.phone = t('modal.errPhone');
    return;
  }
  if (countdown.value > 0) return;
  let sec = 60;
  countdown.value = sec;
  timer = setInterval(() => {
    sec -= 1;
    countdown.value = sec;
    if (sec <= 0) { clearInterval(timer as ReturnType<typeof setTimeout>); countdown.value = 0; }
  }, 1000);
};

const handleNext = () => {
  const newErrors: FormErrors = {};
  if (fields.name.trim().length < 2)    newErrors.name    = t('modal.errName');
  if (fields.company.trim().length < 2) newErrors.company = t('modal.errName');
  if (!PHONE_REG.test(fields.phone))    newErrors.phone   = t('modal.errPhone');
  if (fields.code.trim().length !== 6)  newErrors.code    = t('modal.errCode');
  if (!fields.agreed)                   newErrors.tos     = t('modal.errTos');
  if (Object.keys(newErrors).length > 0) {
    Object.assign(errors, newErrors);
    return;
  }
  Object.keys(errors).forEach(k => delete errors[k as keyof FormErrors]);
  // 保存手机号供下次自动填入
  sessionStorage.setItem('tp_last_phone', fields.phone);
  emit('next');
};

/* ═══════ Field 子组件 ═══════ */
interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
}

const Field = {
  props: ['label', 'required', 'error'],
  setup(props: FieldProps, { slots }: SetupContext) {
    const { t: _t } = useI18n();
    return () => h('div', { class: s.formGroup }, [
      h('label', { class: s.label }, [
        props.label,
        props.required && h('span', { class: s.required }, _t('modal.required')),
      ]),
      slots.default?.(),
      props.error && h('span', { class: s.errorMsg }, props.error),
    ]);
  },
};
</script>
