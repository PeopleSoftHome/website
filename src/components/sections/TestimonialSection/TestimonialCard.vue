<template>
  <div :class="s.card">
    <div :class="s.tags">
      <span :class="s.tagIndustry">{{ industry }}</span>
      <span :class="s.tagProduct">{{ product }}</span>
    </div>
    <div :class="s.quote" aria-hidden="true">"</div>
    <p :class="s.text">{{ text }}</p>
    <div :class="s.author">
      <div :class="s.avatar" :style="{ background: avatarGrad }" aria-hidden="true">
        {{ avatarChar }}
      </div>
      <div>
        <div :class="s.name">{{ name }}</div>
        <div :class="s.title">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import s from './TestimonialCard.module.css';

defineProps({
  industry:   { type: String, required: true },
  product:    { type: String, required: true },
  text:       { type: String, required: true },
  name:       { type: String, required: true },
  title:      { type: String, required: true },
  avatarGrad: { type: String, required: true },
  avatarChar: { type: String, required: true },
});
</script>
