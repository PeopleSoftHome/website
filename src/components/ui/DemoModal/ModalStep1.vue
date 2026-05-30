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

<script setup>
import { ref, reactive, inject, onUnmounted, h, watch, computed, onMounted } from 'vue';
import s from './DemoModal.module.css';

const PHONE_REG = /^1[3-9]\d{9}$/;

const { t } = inject('i18n', { t: (k) => k });
const modalStore = inject('modal', { formData: { value: {} } });
const emit = defineEmits(['next']);

const fields = reactive({ name: '', company: '', phone: '', code: '', agreed: false });
const errors = reactive({});
const countdown = ref(0);
let timer = null;
const nameRef = ref(null);

// 同步到 store
watch(fields, (val) => {
  modalStore.formData.value.name = val.name;
  modalStore.formData.value.company = val.company;
  modalStore.formData.value.phone = val.phone;
  modalStore.formData.value.code = val.code;
}, { deep: true });

/* ── 手机号格式化：13800000000 → 138 0000 0000 ── */
const formattedPhone = computed(() => {
  const raw = fields.phone.replace(/\D/g, '');
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 3)} ${raw.slice(3)}`;
  return `${raw.slice(0, 3)} ${raw.slice(3, 7)} ${raw.slice(7, 11)}`;
});

const handlePhoneInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
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

const autoFillPhone = async () => {
  try {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      const props = ['tel'];
      const contacts = await navigator.contacts.select(props, { multiple: false });
      if (contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
        const raw = contacts[0].tel[0].replace(/\D/g, '');
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

const clearError = (key) => {
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
    if (sec <= 0) { clearInterval(timer); countdown.value = 0; }
  }, 1000);
};

const handleNext = () => {
  const newErrors = {};
  if (fields.name.trim().length < 2)    newErrors.name    = t('modal.errName');
  if (fields.company.trim().length < 2) newErrors.company = t('modal.errName');
  if (!PHONE_REG.test(fields.phone))    newErrors.phone   = t('modal.errPhone');
  if (fields.code.trim().length !== 6)  newErrors.code    = t('modal.errCode');
  if (!fields.agreed)                   newErrors.tos     = t('modal.errTos');
  if (Object.keys(newErrors).length > 0) {
    Object.assign(errors, newErrors);
    return;
  }
  Object.keys(errors).forEach(k => delete errors[k]);
  // 保存手机号供下次自动填入
  sessionStorage.setItem('tp_last_phone', fields.phone);
  emit('next');
};

/* ═══════ Field 子组件 ═══════ */
const Field = {
  props: ['label', 'required', 'error'],
  setup(props, { slots }) {
    const i18n = inject('i18n', { t: (k) => k });
    return () => h('div', { class: s.formGroup }, [
      h('label', { class: s.label }, [
        props.label,
        props.required && h('span', { class: s.required }, i18n.t('modal.required')),
      ]),
      slots.default?.(),
      props.error && h('span', { class: s.errorMsg }, props.error),
    ]);
  },
};
</script>
