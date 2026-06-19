<template>
  <BaseModal
    :is-open="isOpen"
    :aria-label="mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')"
    :overlay-class-name="[s.overlay, isOpen ? s.overlayOpen : ''].join(' ')"
    @close="close"
  >
    <div :class="s.modal">
      <button :class="s.closeBtn" @click="close" :aria-label="t('modal.close')">
        <Icon name="close" :size="18" />
      </button>

      <h3 :class="s.title">{{ mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle') }}</h3>
      <p :class="s.subtitle">{{ mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle') }}</p>

      <div v-if="error" :class="s.errorBox">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div :class="s.formGroup">
          <label :class="s.label">{{ t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            :class="[s.input, fieldError.email ? s.inputError : '']"
            :placeholder="t('auth.emailPlaceholder')"
            required
          />
          <span v-if="fieldError.email" :class="s.errorMsg">{{ fieldError.email }}</span>
        </div>

        <div :class="s.formGroup">
          <label :class="s.label">{{ t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            :class="[s.input, fieldError.password ? s.inputError : '']"
            :placeholder="t('auth.passwordPlaceholder')"
            required
          />
          <span v-if="fieldError.password" :class="s.errorMsg">{{ fieldError.password }}</span>
        </div>

        <div v-if="mode === 'register'" :class="s.formGroup">
          <label :class="s.label">{{ t('auth.confirmPassword') }}</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            :class="[s.input, fieldError.confirmPassword ? s.inputError : '']"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            required
          />
          <span v-if="fieldError.confirmPassword" :class="s.errorMsg">{{ fieldError.confirmPassword }}</span>
        </div>

        <div v-if="mode === 'register'" :class="s.formGroup">
          <label :class="s.label">{{ t('auth.name') }}</label>
          <input
            v-model="form.name"
            type="text"
            :class="[s.input, fieldError.name ? s.inputError : '']"
            :placeholder="t('auth.namePlaceholder')"
            required
          />
          <span v-if="fieldError.name" :class="s.errorMsg">{{ fieldError.name }}</span>
        </div>

        <div v-if="mode === 'register'" :class="s.formGroup">
          <label :class="s.label">{{ t('auth.company') }}</label>
          <input
            v-model="form.company"
            type="text"
            :class="[s.input, fieldError.company ? s.inputError : '']"
            :placeholder="t('auth.companyPlaceholder')"
          />
          <span v-if="fieldError.company" :class="s.errorMsg">{{ fieldError.company }}</span>
        </div>

        <button type="submit" :class="s.submitBtn" :disabled="submitting">
          {{ submitting ? t('auth.submitting') : (mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')) }}
        </button>
      </form>

      <div :class="s.switch">
        <span>{{ mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount') }}</span>
        <button type="button" :class="s.switchBtn" @click="toggleMode">
          {{ mode === 'login' ? t('auth.toRegister') : t('auth.toLogin') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, inject } from 'vue';
import Icon from '../Icon/Icon.vue';
import BaseModal from '../BaseModal/BaseModal.vue';
import { usePublicConfig } from '@/composables/usePublicConfig.js';
import s from './AuthModal.module.css';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  defaultMode: { type: String, default: 'login' },
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const auth = inject('auth', {});
const { recaptchaSiteKey } = usePublicConfig();

const mode = ref(props.defaultMode);
const error = ref('');
const submitting = ref(false);
const form = ref({ email: '', password: '', confirmPassword: '', name: '', company: '' });
const fieldError = ref({});

watch(() => props.isOpen, (open) => {
  if (open) {
    mode.value = props.defaultMode;
    error.value = '';
    fieldError.value = {};
    form.value = { email: '', password: '', confirmPassword: '', name: '', company: '' };
  }
});

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  error.value = '';
  fieldError.value = {};
};

const close = () => {
  emit('close');
};

const validate = () => {
  const errors = {};
  if (!form.value.email) errors.email = t('auth.emailRequired');
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) errors.email = t('auth.emailInvalid');

  if (!form.value.password) errors.password = t('auth.passwordRequired');
  else if (form.value.password.length < 8) errors.password = t('auth.passwordMin');
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(form.value.password)) {
    errors.password = t('auth.passwordComplexity');
  }

  if (mode.value === 'register') {
    if (!form.value.confirmPassword) errors.confirmPassword = t('auth.confirmRequired');
    else if (form.value.confirmPassword !== form.value.password) errors.confirmPassword = t('auth.passwordMismatch');
    if (!form.value.name || form.value.name.length < 2) errors.name = t('auth.nameMin');
  }

  fieldError.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;
  error.value = '';
  submitting.value = true;

  try {
    if (mode.value === 'login') {
      await auth.login(form.value.email, form.value.password);
    } else {
      // 注册时获取 reCAPTCHA token
      let recaptchaToken = '';
      if (recaptchaSiteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(
            recaptchaSiteKey,
            { action: 'register' },
          );
        } catch {
          // reCAPTCHA 未加载时继续提交
        }
      }
      await auth.register({
        email: form.value.email,
        password: form.value.password,
        name: form.value.name,
        company: form.value.company,
        recaptchaToken,
      });
      // 注册成功后自动登录
      await auth.login(form.value.email, form.value.password);
    }
    close();
  } catch (e) {
    error.value = e.message || t('auth.genericError');
  } finally {
    submitting.value = false;
  }
};
</script>
