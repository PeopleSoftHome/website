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
          v-for="(res, i) in RESOURCES"
          :key="res.id"
          v-bind="res"
          :delay="i"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { RESOURCES } from '@/data/resources.js';
import SectionHeader from '../../ui/SectionHeader/SectionHeader.vue';
import ResourceCard from './ResourceCard.vue';
import RevealWrapper from '../../ui/RevealWrapper/RevealWrapper.vue';
import s from './ResourceSection.module.css';

const { t } = inject('i18n', { t: (k) => k });
</script>
