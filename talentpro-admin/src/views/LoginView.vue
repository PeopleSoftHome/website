<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <h2 style="margin:0;text-align:center;color:var(--admin-color-primary)">{{ t('login.title') }}</h2>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="form.email" :placeholder="t('login.email')" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('login.password')" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width:100%">{{ t('login.login') }}</el-button>
        </el-form-item>
        <el-form-item v-if="isDev">
          <el-button :loading="devLoading" @click="handleDevLogin" style="width:100%">
            ⚡ {{ t('login.devLogin') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const { t } = useI18n();
const auth = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const devLoading = ref(false);
const isDev = import.meta.env.DEV;

const form = reactive({ email: '', password: '' });
const rules = {
  email: [{ required: true, message: t('login.emailRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: 'blur' }],
};

const handleLogin = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;
    await auth.login(form.email, form.password);
    ElMessage.success(t('login.loginSuccess'));
    router.push('/dashboard');
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('login.loginFailed'));
  } finally {
    loading.value = false;
  }
};

const handleDevLogin = async () => {
  try {
    devLoading.value = true;
    await auth.devLogin();
    ElMessage.success(t('login.devLoginSuccess'));
    router.push('/dashboard');
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || t('login.devLoginFailed'));
  } finally {
    devLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--admin-bg-base) 0%, var(--admin-border-light) 100%);
}
.login-card {
  width: 400px;
  border-radius: 12px;
}
</style>
