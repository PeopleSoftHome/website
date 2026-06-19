<template>
  <footer :class="s.footer">
    <div class="container">
      <div :class="s.top">
        <div :class="s.brand">
          <div :class="s.logo">TalentPro</div>
          <p :class="s.desc">{{ t('footer.desc') }}</p>
          <div :class="s.contact">
            <strong>{{ t('footer.preSale') }}</strong>
            <strong>{{ t('footer.afterSale') }}</strong>
          </div>
          <div :class="s.qrSection">
            <div v-for="i in 2" :key="i" :class="s.qrItem">
              <QrPlaceholder />
              <span>{{ t(`footer.qr${i}`) }}</span>
            </div>
          </div>
          <div :class="s.socialRow">
            <a
              v-for="(item, idx) in displaySocialLinks"
              :key="idx"
              :href="item.href || '#'" 
              :class="s.socialIcon"
              :aria-label="item.ariaLabel || item.label || ''"
              target="_blank"
              rel="noopener noreferrer"
            >
              <component :is="item.component" v-if="item.component" />
              <span v-else-if="item.label" :class="s.socialFallback">{{ item.label }}</span>
            </a>
          </div>
          <div :class="s.hotSection">
            <div :class="s.hotTitle">{{ t('footer.hotTitle') }}</div>
            <div :class="s.hotTags">
              <a v-for="tag in displayHotTags" :key="tag" href="#" :class="s.hotTag">{{ tag }}</a>
            </div>
          </div>
        </div>
        <div v-for="col in footerLinks" :key="col.title">
          <div :class="s.colTitle">{{ col.title }}</div>
          <ul :class="s.links">
            <li v-for="link in col.links" :key="link.label">
              <a :href="link.href" :class="s.link">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div :class="s.bottom">
        <span>{{ siteCopyright || t('footer.copyright') }}</span>
        <div :class="s.bottomLinks">
          <a href="#">{{ t('footer.icp') }}</a>
          <a href="#">{{ t('footer.privacy') }}</a>
          <a href="#">{{ t('footer.terms') }}</a>
          <a href="#">{{ t('footer.sitemap') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { useNavigation } from '@/composables/useNavigation.js';
import { useSiteConfig } from '@/composables/useSiteConfig.js';
import { HOT_TAGS } from '@/data/navigation.js';
import QrPlaceholder from '@/components/icons/QrPlaceholder.vue';
import ZhihuIcon from '@/components/icons/ZhihuIcon.vue';
import WeiboIcon from '@/components/icons/WeiboIcon.vue';
import s from './Footer.module.css';

const { t } = useI18n();
const { footerLinks } = useNavigation();
const { copyright: siteCopyright, hotTags: cmsHotTags, socialLinks: cmsSocialLinks } = useSiteConfig();

const displayHotTags = computed(() => (cmsHotTags.value.length ? cmsHotTags.value : HOT_TAGS));

const iconMap = { zhihu: markRaw(ZhihuIcon), weibo: markRaw(WeiboIcon) };
const defaultSocialLinks = computed(() => [
  { component: markRaw(ZhihuIcon), href: '#', ariaLabel: t('footer.zhihuAria') },
  { component: markRaw(WeiboIcon), href: '#', ariaLabel: t('footer.weiboAria') },
]);
const displaySocialLinks = computed(() => {
  if (cmsSocialLinks.value.length) {
    return cmsSocialLinks.value.map((item) => ({
      ...item,
      component: iconMap[item.icon] || null,
    }));
  }
  return defaultSocialLinks.value;
});
</script>
