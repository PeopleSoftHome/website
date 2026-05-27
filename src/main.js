import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initSentry } from './utils/sentry.js';
import './styles/global.css';
import './styles/animations.css';
import './styles/reveal.css';

const app = createApp(App);
app.use(router);
initSentry(app);
app.mount('#app');
