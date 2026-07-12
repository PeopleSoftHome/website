/**
 * main 模块
 *
 * 位于: main.ts
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/variables.css';
import './styles/responsive.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import VueECharts from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { permissionDirective } from './directives/permission.js';

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.component('v-chart', VueECharts);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(ElementPlus);
app.directive('permission', permissionDirective);
app.mount('#app');
