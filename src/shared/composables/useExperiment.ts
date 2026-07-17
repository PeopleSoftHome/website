/**
 * useExperiment — A/B 实验分流 Composable
 *
 * 闭环：后端确定性分桶（GET /experiments/:key/assign，同 sessionId 恒定同组）
 * → 曝光由后端幂等记录 → 前端用变体 config 渲染 → trackConversion() 归因。
 * 实验不存在/未运行/接口失败时 assignment 为 null，调用方回退默认文案（A 组语义）。
 */
import { ref, computed, onMounted, type Ref } from 'vue';
import { apiClient } from '@/shared/api/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { getOrCreateSessionId } from '@/composables/useSessionId';

interface ExperimentAssignment {
  experimentId: string;
  key: string;
  variant: 'A' | 'B';
  config: Record<string, unknown>;
}

export function useExperiment(key: string) {
  const assignment: Ref<ExperimentAssignment | null> = ref(null);
  const variant = computed<'A' | 'B'>(() => assignment.value?.variant || 'A');
  const config = computed<Record<string, unknown>>(() => assignment.value?.config || {});

  onMounted(async () => {
    try {
      const sessionId = getOrCreateSessionId(STORAGE_KEYS.SESSION_ID, 'sessionStorage');
      const res = await apiClient.get(`/experiments/${key}/assign`, {
        params: { sessionId },
        silent: true,
      } as Record<string, unknown>);
      const data = ((res as { data?: unknown })?.data ?? res) as ExperimentAssignment | null;
      assignment.value = data && data.experimentId ? data : null;
    } catch {
      assignment.value = null;
    }
  });

  const trackEvent = async (eventType: string, properties: Record<string, unknown> = {}) => {
    if (!assignment.value) return;
    try {
      const sessionId = getOrCreateSessionId(STORAGE_KEYS.SESSION_ID, 'sessionStorage');
      await apiClient.post(`/experiments/${assignment.value.experimentId}/events`, {
        variant: assignment.value.variant,
        eventType,
        sessionId,
        properties,
      });
    } catch {
      // 埋点失败不影响业务
    }
  };

  const trackConversion = (properties: Record<string, unknown> = {}) =>
    trackEvent('conversion', properties);

  return { assignment, variant, config, trackEvent, trackConversion };
}
