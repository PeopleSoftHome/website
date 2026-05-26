<template>
  <div>
    <div :class="s.stepTitle">{{ t('modal.step1Title') }}</div>
    <div :class="s.stepSub">{{ t('modal.step1Sub') }}</div>

    <div :class="s.formRow">
      <Field :label="t('modal.labelName')" required :error="errors.name">
        <input
          :class="[s.input, errors.name ? s.inputError : '']"
          name="name" :placeholder="t('modal.phName')"
          v-model="fields.name" @input="clearError('name')"
          autocomplete="name"
        />
      </Field>
      <Field :label="t('modal.labelCompany')" required :error="errors.company">
        <input
          :class="[s.input, errors.company ? s.inputError : '']"
          name="company" :placeholder="t('modal.phCompany')"
          v-model="fields.company" @input="clearError('company')"
          autocomplete="organization"
        />
      </Field>
    </div>

    <Field :label="t('modal.labelPhone')" required :error="errors.phone">
      <input
        :class="[s.input, errors.phone ? s.inputError : '']"
        name="phone" :placeholder="t('modal.phPhone')" type="tel" maxlength="11"
        v-model="fields.phone" @input="clearError('phone')"
        autocomplete="tel"
      />
    </Field>

    <Field :label="t('modal.labelCode')" required :error="errors.code">
      <div :class="s.verifyRow">
        <input
          :class="[s.input, errors.code ? s.inputError : '']"
          name="code" :placeholder="t('modal.phCode')" type="number" maxlength="6"
          v-model="fields.code" @input="clearError('code')"
        />
        <button :class="s.verifyBtn" @click="sendCode" :disabled="countdown > 0">
          {{ countdown > 0 ? t('modal.resend', { n: countdown }) : t('modal.sendCode') }}
        </button>
      </div>
    </Field>

    <button :class="s.submitBtn" @click="handleNext">{{ t('modal.next') }}</button>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onUnmounted, h } from 'vue';
import s from './DemoModal.module.css';

const PHONE_REG = /^1[3-9]\d{9}$/;

const { t } = inject('i18n', { t: (k) => k });
const emit = defineEmits(['next']);

const fields = reactive({ name: '', company: '', phone: '', code: '' });
const errors = reactive({});
const countdown = ref(0);
let timer = null;

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
  if (fields.name.trim().length < 2)   newErrors.name    = t('modal.errName');
  if (fields.company.trim().length < 2) newErrors.company = t('modal.errName');
  if (!PHONE_REG.test(fields.phone))   newErrors.phone   = t('modal.errPhone');
  if (fields.code.trim().length !== 6) newErrors.code    = t('modal.errCode');
  if (Object.keys(newErrors).length > 0) {
    Object.assign(errors, newErrors);
    return;
  }
  Object.keys(errors).forEach(k => delete errors[k]);
  emit('next');
};

/* ═══════ Field 子组件（原 React 版本内部组件）═══════ */
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
