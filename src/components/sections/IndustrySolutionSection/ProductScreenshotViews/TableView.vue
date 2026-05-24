<template>
  <div>
    <table :class="s.table">
      <thead>
        <tr><th>员工</th><th>班次</th><th>打卡</th><th>状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in data.rows" :key="row.name">
          <td>{{ row.name }}</td>
          <td>{{ row.shift }}</td>
          <td>{{ row.time }}</td>
          <td>
            <span :class="[s.dot, s[`dot_${row.status}`]]" />
            {{ row.label }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="data.tip" :class="s.tip">
      <div :class="s.tipLabel">AI 智能提醒</div>
      <div :class="s.tipText">{{ data.tip }}</div>
    </div>
  </div>
</template>

<script setup>
import s from '../ProductScreenshot.module.css';

defineProps({ data: { type: Object, required: true } });
</script>
