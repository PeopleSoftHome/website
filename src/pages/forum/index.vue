<template>
  <div>

    <main :class="s.forumPage">
      <div class="container">
        <h1 :class="s.pageTitle">{{ t('forum.title') }}</h1>

        <div :class="s.forumCategories">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="[s.catBtn, activeCategory === cat.id ? s.catActive : '']"
            @click="setCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div v-if="loading" :class="s.forumLoading">
          <div v-for="i in 3" :key="i" :class="s.skeletonRow">
            <Skeleton width="40px" height="40px" radius="50%" />
            <div style="flex:1;display:flex;flex-direction:column;gap:8px">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="14px" />
            </div>
            <Skeleton width="80px" height="14px" />
          </div>
        </div>

        <div v-else-if="error" :class="s.errorBox">
          <p>{{ error }}</p>
          <button :class="s.retryBtn" @click="fetchTopics">{{ t('common.retry') }}</button>
        </div>

        <div v-else-if="topics.length" :class="s.topicList">
          <div
            v-for="topic in topics"
            :key="topic.id"
            :class="s.topicItem"
            @click="goToTopic(topic.id)"
          >
            <div :class="s.topicLeft">
              <Avatar :size="40" :name="topic.author?.name" />
              <div :class="s.topicInfo">
                <h3 :class="s.topicTitle">
                  <span v-if="topic.isPinned" :class="[s.tag, s.tagDanger]">{{ t('forum.pinned') }}</span>
                  <span v-if="topic.isLocked" :class="[s.tag, s.tagInfo]">{{ t('forum.locked') }}</span>
                  {{ topic.title }}
                </h3>
                <p :class="s.topicMeta">
                  <span>{{ topic.category?.name }}</span>
                  <span>{{ topic.author?.name || t('comment.anonymous') }}</span>
                  <span>{{ formatDate(topic.createdAt) }}</span>
                </p>
              </div>
            </div>
            <div :class="s.topicStats">
              <span>💬 {{ topic._count?.posts || 0 }}</span>
              <span>👁 {{ topic.viewCount || 0 }}</span>
            </div>
          </div>
        </div>

        <div v-else :class="s.forumEmpty">
          <p>{{ t('forum.noTopics') }}</p>
        </div>

        <Pagination
          v-if="total > pageSize"
          :total="total"
          :page-size="pageSize"
          v-model="page"
          @change="fetchTopics"
        />
      </div>
    </main>

  </div>
</template>

<script setup>
definePageMeta({ title: 'forum.pageTitle' });
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { FORUM_PAGE_SIZE } from '@/constants/pagination.js';
import { injectJsonLd, removeJsonLd } from '@/utils/jsonld.js';
import Avatar from '@/components/ui/Avatar/Avatar.vue';
import Skeleton from '@/components/ui/Skeleton/Skeleton.vue';
import Pagination from '@/components/ui/Pagination/Pagination.vue';
import { forumApi } from '@/api/forum.js';
import { formatDate } from '@/utils/date.js';
import s from './index.vue.module.css';

const { t } = useI18n();

const page = ref(1);
const pageSize = FORUM_PAGE_SIZE;
const activeCategory = ref(null);

const { data: topicsRes, pending: loading, error: fetchError, refresh: fetchTopics } = useAsyncData(
  'forum-topics',
  () => forumApi.getTopics({
    page: page.value,
    pageSize,
    categoryId: activeCategory.value || undefined,
  }),
  { server: false, default: () => ({ data: [], meta: { total: 0 } }) }
);

const topics = computed(() => topicsRes.value?.data || []);
const total = computed(() => topicsRes.value?.meta?.total || 0);
const error = computed(() => {
  if (!fetchError.value) return null;
  return fetchError.value?.response?.data?.message || fetchError.value?.message || t('common.loadError');
});

const { data: catRes } = useAsyncData(
  'forum-categories',
  () => forumApi.getCategories(),
  { server: false, default: () => [] }
);
const categories = computed(() => catRes.value?.data || catRes.value || []);

const setCategory = (id) => {
  activeCategory.value = activeCategory.value === id ? null : id;
  page.value = 1;
  fetchTopics();
};

const goToTopic = (id) => {
  navigateTo(`/forum/topic/${id}`);
};

onMounted(() => {
  injectJsonLd({ '@context': 'https://schema.org', '@type': 'DiscussionForumPosting', name: t('forum.title') });
});
onUnmounted(removeJsonLd);
</script>
