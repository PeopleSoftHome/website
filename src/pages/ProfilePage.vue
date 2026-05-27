<template>
  <div>
    <NavBar />
    <main class="profile-page">
      <div class="container">
        <div v-if="user" class="profile-card">
          <div class="profile-header">
            <Avatar :src="user.avatar" :name="user.name" :size="80" />
            <div class="profile-info">
              <h1 class="profile-name">{{ user.name || user.email }}</h1>
              <p class="profile-email">{{ user.email }}</p>
              <p v-if="user.workspaceName" class="profile-workspace">
                {{ user.workspaceName }} · {{ user.workspaceRole }}
              </p>
              <p v-if="user.bio" class="profile-bio">{{ user.bio }}</p>
              <p class="profile-meta">{{ t('profile.joined') }} {{ formatDate(user.createdAt) }}</p>
            </div>
            <button class="profile-edit-btn" @click="editing = true">
              <Icon name="edit" :size="14" /> {{ t('profile.edit') }}
            </button>
          </div>

          <div v-if="editing" class="profile-edit-form">
            <div class="form-group">
              <label>{{ t('profile.name') }}</label>
              <input v-model="editForm.name" type="text" />
            </div>
            <div class="form-group">
              <label>{{ t('profile.bio') }}</label>
              <textarea v-model="editForm.bio" rows="3" />
            </div>
            <div class="form-group">
              <label>{{ t('profile.avatar') }}</label>
              <input v-model="editForm.avatar" type="text" placeholder="https://..." />
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="editing = false">{{ t('comment.cancel') }}</button>
              <button class="btn-primary" :disabled="saving" @click="saveProfile">
                {{ saving ? t('comment.submitting') : t('profile.save') }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="profile-empty">
          {{ t('profile.loading') }}
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import NavBar from '@/components/layout/NavBar/NavBar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import Icon from '@/components/ui/Icon/Icon.vue';
import { userApi } from '@/api/user.js';

const { t } = inject('i18n', { t: (k) => k });
const auth = inject('auth', { user: { value: null }, fetchProfile: async () => {} });

const user = ref(null);
const editing = ref(false);
const saving = ref(false);
const editForm = ref({ name: '', bio: '', avatar: '' });

const loadUser = async () => {
  try {
    await auth.fetchProfile();
    user.value = auth.user.value;
    editForm.value = {
      name: user.value?.name || '',
      bio: user.value?.bio || '',
      avatar: user.value?.avatar || '',
    };
  } catch (e) {
    if (e.response?.status === 401 || e.message?.includes('未授权')) {
      // 未登录，提示并打开登录弹窗
      auth.logout();
      alert(t('auth.noAccount') || '请先登录');
      window.location.href = '/';
    }
    console.error(e);
  }
};

const saveProfile = async () => {
  saving.value = true;
  try {
    const res = await userApi.updateProfile(editForm.value);
    const updated = (res.data || res)?.user || res.data || res;
    user.value = updated;
    auth.setUser(updated);
    editing.value = false;
  } catch (e) {
    alert(e.response?.data?.message || t('profile.saveError'));
  }
  saving.value = false;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(loadUser);
</script>

<style scoped>
.profile-page { padding: 60px 0 80px; background: var(--page-bg); min-height: 60vh; }
.profile-card {
  max-width: 640px;
  margin: 0 auto;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 36px;
}
.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  position: relative;
}
.profile-info { flex: 1; }
.profile-name { font-size: 24px; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
.profile-email { font-size: 14px; color: var(--gray-500); margin-bottom: 8px; }
.profile-bio { font-size: 15px; color: var(--gray-700); line-height: 1.6; margin-bottom: 8px; }
.profile-meta { font-size: 13px; color: var(--gray-500); }

.profile-edit-btn {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
  background: var(--card-bg);
  color: var(--gray-700);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.profile-edit-btn:hover { border-color: var(--primary); color: var(--primary); }

.profile-edit-form { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--card-border); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-700); margin-bottom: 6px; }
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  color: var(--gray-900);
  background: var(--card-bg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-secondary {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
  background: var(--card-bg);
  color: var(--gray-700);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.profile-empty { text-align: center; padding: 60px; color: var(--gray-500); }

[data-theme="dark"] .profile-name { color: var(--gray-50); }
[data-theme="dark"] .profile-bio { color: var(--gray-400); }
</style>
