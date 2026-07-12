import { ref, onMounted } from 'vue';
import { apiClient } from '@/shared/api/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { ENDPOINTS } from '@/constants/endpoints';
import { getOrCreateSessionId } from '@/composables/useSessionId';

interface Experiment {
  id: string | number;
  key: string;
  trafficSplit?: number;
}

const experiments = ref<Experiment[]>([]);
const variants = ref<Record<string, 'A' | 'B'>>({});
const sessionId = ref('');

function getSessionId() {
  return getOrCreateSessionId(STORAGE_KEYS.SESSION_ID, 'sessionStorage');
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function assignVariant(experiment: Experiment, sid: string): 'A' | 'B' {
  const hash = hashString(`${experiment.key}-${sid}`);
  const bucket = hash % 100;
  return bucket < (experiment.trafficSplit || 0.5) * 100 ? 'B' : 'A';
}

export function useAbTest() {
  sessionId.value = getSessionId();

  const loadExperiments = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.EXPERIMENTS_RUNNING);
      experiments.value = (res.data?.data || []) as Experiment[];
      for (const exp of experiments.value) {
        variants.value[exp.key] = assignVariant(exp, sessionId.value);
        // 上报 impression
        apiClient.post(`/experiments/${exp.id}/events`, {
          variant: variants.value[exp.key],
          eventType: 'impression',
          sessionId: sessionId.value,
        }).catch(() => {});
      }
    } catch {
      experiments.value = [];
    }
  };

  const getVariant = (key: string) => {
    return variants.value[key] || 'A';
  };

  const trackConversion = (key: string) => {
    const exp = experiments.value.find(e => e.key === key);
    if (!exp) return;
    apiClient.post(`/experiments/${exp.id}/events`, {
      variant: variants.value[key],
      eventType: 'conversion',
      sessionId: sessionId.value,
    }).catch(() => {});
  };

  onMounted(() => {
    loadExperiments();
  });

  return { experiments, variants, getVariant, trackConversion, sessionId };
}
