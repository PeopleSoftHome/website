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
            <a href="#" :class="s.socialIcon" aria-label="知乎"><ZhihuIcon /></a>
            <a href="#" :class="s.socialIcon" aria-label="微博"><WeiboIcon /></a>
          </div>
          <div :class="s.hotSection">
            <div :class="s.hotTitle">{{ t('footer.hotTitle') }}</div>
            <div :class="s.hotTags">
              <a v-for="tag in HOT_TAGS" :key="tag" href="#" :class="s.hotTag">{{ tag }}</a>
            </div>
          </div>
        </div>
        <div v-for="col in FOOTER_LINKS" :key="col.title">
          <div :class="s.colTitle">{{ col.title }}</div>
          <ul :class="s.links">
            <li v-for="link in col.links" :key="link.label">
              <a :href="link.href" :class="s.link">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div :class="s.bottom">
        <span>{{ t('footer.copyright') }}</span>
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

<script setup>
import { inject } from 'vue';
import { FOOTER_LINKS, HOT_TAGS } from '@/data/navigation.js';
import QrPlaceholder from '@/components/icons/QrPlaceholder.jsx';
import ZhihuIcon from '@/components/icons/ZhihuIcon.jsx';
import WeiboIcon from '@/components/icons/WeiboIcon.jsx';
import s from './Footer.module.css';

const { t } = inject('i18n', { t: (k) => k });
</script>
