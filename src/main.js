import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/global.css';
import './styles/animations.css';
import './styles/reveal.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
