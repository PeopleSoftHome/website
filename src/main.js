import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initSentry } from './utils/sentry.js';
import { applyManifests } from './modules/manifest-loader.js';
import './styles/global.css';
import './styles/animations.css';
import './styles/reveal.css';

// Build-time scan of all module manifests
const manifestModules = import.meta.glob('./modules/**/manifest.js', { eager: true });
const manifests = Object.values(manifestModules).map((mod) => mod.default || mod).filter(Boolean);

// Apply all manifests before app mount
applyManifests(manifests, router);

const app = createApp(App);
app.use(router);
initSentry(app);
app.mount('#app');
