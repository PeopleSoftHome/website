import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: { port: 3457 },
  build: {
    outDir: 'dist',
    sourcemap: process.env.SOURCE_MAP === 'true',
    // Admin 为内部后台工具，第三方库（element-plus/echarts）体积较大；
    // 已通过 manualChunks 拆分 vendor，提高告警阈值避免误报。
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // 过滤第三方 @vueuse/core 的 annotation 警告。
      // 注意：本项目未直接依赖 @vueuse/core，该警告来自 element-plus 等 transitive dependency；
      // 若未来引入 @vueuse/core，应移除此过滤并修复根因。
      onLog(level, log, handler) {
        if (log.code === 'INVALID_ANNOTATION' && log.message?.includes('@vueuse/core')) return;
        handler(level, log);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@element-plus/icons-vue')) return 'vendor-icons';
            if (id.includes('element-plus')) {
              const match = id.match(/element-plus\/es\/components\/([^/]+)/);
              if (match) {
                // 按组件首字母拆分为两个 chunk，避免单个 chunk 超过 500KB
                const name = match[1];
                return name.charCodeAt(0) <= 109
                  ? 'vendor-element-plus-components-a-m'
                  : 'vendor-element-plus-components-n-z';
              }
              return 'vendor-element-plus-core';
            }
            if (id.includes('echarts') || id.includes('vue-echarts')) return 'vendor-echarts';
            if (id.includes('@tiptap')) return 'vendor-tiptap';
            if (id.includes('prosemirror')) return 'vendor-prosemirror';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-vue';
            return 'vendor-common';
          }
        },
      },
    },
  },
});
