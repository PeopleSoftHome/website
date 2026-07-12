<template>
  <section :class="s.section" id="resources">
    <div class="container">
      <RevealWrapper>
        <SectionHeader
          :tag="t('resources.sectionTag')"
          :title="t('resources.sectionTitle')"
        />
      </RevealWrapper>
      <div :class="s.grid">
        <ResourceCard
          v-for="(res, i) in displayResources"
          :key="res.id"
          v-bind="res"
          :delay="i"
          @download="openGate(res)"
        />
      </div>
    </div>

    <!-- 下载留资弹窗 -->
    <div v-if="gateOpen" :class="s.gateOverlay" @click.self="gateOpen = false">
      <div :class="s.gateModal">
        <button :class="s.gateClose" @click="gateOpen = false">✕</button>
        <h3 :class="s.gateTitle">{{ t('downloadGate.title', { title: gateResource?.title }) }}</h3>
        <p :class="s.gateSub">{{ t('downloadGate.subtitle') }}</p>
        <input v-model="gateForm.name" :class="s.gateInput" :placeholder="t('downloadGate.name')" />
        <input v-model="gateForm.email" :class="s.gateInput" :placeholder="t('downloadGate.email')" type="email" />
        <input v-model="gateForm.company" :class="s.gateInput" :placeholder="t('downloadGate.company')" />
        <button :class="s.gateSubmit" :disabled="gateLoading" @click="submitGate">
          {{ gateLoading ? t('downloadGate.submitting') : t('downloadGate.submit') }}
        </button>
        <p v-if="gateError" :class="s.gateError">{{ gateError }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useCmsDataByKey } from '@/composables/useCmsData';
import { transformResources } from '@/api/transforms';

import { apiClient } from '@/api/client';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import ResourceCard from './ResourceCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ResourceSection.module.css';

interface ResourceItem {
  id: string;
  type: string;
  typeLabel: string;
  icon: string;
  imgGrad: string;
  title: string;
  desc: string;
  date: string;
  cta: string;
}

const { t } = useI18n();

const { displayItems: rawDisplayResources } = useCmsDataByKey('resources', {
  transform: transformResources,
  fallbackKey: 'resources',
});
const displayResources = computed(() => rawDisplayResources.value as unknown as ResourceItem[]);



// 下载留资
const gateOpen = ref(false);
const gateResource = ref<ResourceItem | null>(null);
const gateLoading = ref(false);
const gateError = ref('');
const gateForm = ref({ name: '', email: '', company: '' });

const openGate = (res: ResourceItem) => {
  gateResource.value = res;
  gateOpen.value = true;
  gateError.value = '';
};

const submitGate = async () => {
  if (!gateForm.value.name || !gateForm.value.email) {
    gateError.value = t('downloadGate.required');
    return;
  }
  gateLoading.value = true;
  try {
    await apiClient.post('/downloads', {
      resourceId: gateResource.value?.id,
      name: gateForm.value.name,
      email: gateForm.value.email,
      company: gateForm.value.company,
    });
    gateOpen.value = false;
    gateForm.value = { name: '', email: '', company: '' };
  } catch (e) {
    const err = e as { response?: { data?: { error?: { message?: string } } } };
    gateError.value = err.response?.data?.error?.message || t('downloadGate.error');
  } finally {
    gateLoading.value = false;
  }
};
</script>
