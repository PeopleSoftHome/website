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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'vendor-element-plus';
            if (id.includes('echarts') || id.includes('vue-echarts')) return 'vendor-echarts';
            if (id.includes('@tiptap')) return 'vendor-tiptap';
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-vue';
            return 'vendor';
          }
        },
      },
    },
  },
});
