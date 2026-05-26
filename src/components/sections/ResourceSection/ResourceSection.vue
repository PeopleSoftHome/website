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
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { RESOURCES } from '@/data/resources.js';
import { useApiData } from '@/composables/useApiData.js';
import { cmsApi } from '@/api/cms.js';
import { transformResources } from '@/api/transforms.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import ResourceCard from './ResourceCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ResourceSection.module.css';

const { t } = inject('i18n', { t: (k) => k });

// API 数据（fallback 为静态数据）
const apiResources = ref([]);
useApiData(async () => {
  const data = await cmsApi.getResources();
  return transformResources(data);
}, apiResources);

const displayResources = computed(() => (apiResources.value.length > 0 ? apiResources.value : RESOURCES));
</script>
