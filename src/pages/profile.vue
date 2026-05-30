<template>
  <div>

    <main :class="s.profilePage">
      <div class="container">
        <div v-if="user" :class="s.profileCard">
          <div :class="s.profileHeader">
            <Avatar :src="user.avatar" :name="user.name" :size="80" />
            <div :class="s.profileInfo">
              <h1 :class="s.profileName">{{ user.name || user.email }}</h1>
              <p :class="s.profileEmail">{{ user.email }}</p>
              <p v-if="user.workspaceName" class="profile-workspace">
                {{ user.workspaceName }} · {{ user.workspaceRole }}
              </p>
              <p v-if="user.bio" :class="s.profileBio">{{ user.bio }}</p>
              <p :class="s.profileMeta">{{ t('profile.joined') }} {{ formatDate(user.createdAt) }}</p>
            </div>
            <button :class="s.profileEditBtn" @click="editing = true">
              <Icon name="edit" :size="14" /> {{ t('profile.edit') }}
            </button>
          </div>

          <div v-if="editing" :class="s.profileEditForm">
            <div :class="s.formGroup">
              <label>{{ t('profile.name') }}</label>
              <input v-model="editForm.name" type="text" />
            </div>
            <div :class="s.formGroup">
              <label>{{ t('profile.bio') }}</label>
              <textarea v-model="editForm.bio" rows="3" />
            </div>
            <div :class="s.formGroup">
              <label>{{ t('profile.avatar') }}</label>
              <input v-model="editForm.avatar" type="text" placeholder="https://..." />
            </div>
            <div :class="s.formActions">
              <button :class="s.btnSecondary" @click="editing = false">{{ t('comment.cancel') }}</button>
              <button :class="s.btnPrimary" :disabled="saving" @click="saveProfile">
                {{ saving ? t('comment.submitting') : t('profile.save') }}
              </button>
            </div>
          </div>
        </div>

        <div v-else :class="s.profileEmpty">
          {{ t('profile.loading') }}
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'profile.title', requiresAuth: true });
import { ref, inject, onMounted, onUnmounted } from 'vue';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import Icon from '@/components/ui/Icon/Icon.vue';
import { userApi } from '@/api/user.js';
import { formatDate } from '@/utils/date.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import s from './ProfilePage.module.css';

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
      import('@/utils/toast.js').then(({ showToast }) => showToast(t('auth.noAccount'), 'warning'));
      window.location.href = '/';
    }
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
    import('@/utils/toast.js').then(({ showToast }) => showToast(e.response?.data?.message || t('profile.saveError'), 'error'));
  }
  saving.value = false;
};

onMounted(() => {
  loadUser();
  injectJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('profile.jsonLdName'),
    description: t('profile.jsonLdDesc'),
    url: 'https://talentpro.cn/profile',
    publisher: {
      '@type': 'Organization',
      name: 'TalentPro',
      logo: { '@type': 'ImageObject', url: 'https://talentpro.cn/logo.png' },
    },
  });
});
onUnmounted(removeJsonLd);
</script>
