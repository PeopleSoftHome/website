/**
 * usePersonalization — 访客分群信号
 *
 * 产出 segment 字符串（如 `new:mobile:zh`、`returning:desktop:en`）：
 *  - 新访/回访：localStorage 累计访问次数（每会话只计一次，sessionStorage 去重）
 *  - 设备：视口宽度 <768 → mobile，否则 desktop
 *  - 语言：当前 i18n locale
 *
 * 当前消费方：`useExperiment`（随 assign 上报，后端写入 impression.properties.segment）。
 * SSR 安全：服务端返回默认值，客户端 onMounted 后校正。
 */
import { computed } from 'vue';

const VISIT_COUNT_KEY = 'tp-visit-count';
const VISIT_COUNTED_KEY = 'tp-visit-counted';

interface VisitProfile {
  type: 'new' | 'returning';
  device: 'mobile' | 'desktop';
}

let cachedProfile: VisitProfile | null = null;

function resolveProfile(): VisitProfile {
  if (cachedProfile) return cachedProfile;
  if (typeof window === 'undefined') return { type: 'new', device: 'desktop' };
  try {
    if (!sessionStorage.getItem(VISIT_COUNTED_KEY)) {
      const count = (parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) || 0) + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(count));
      sessionStorage.setItem(VISIT_COUNTED_KEY, '1');
    }
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '1', 10) || 1;
    cachedProfile = {
      type: count > 1 ? 'returning' : 'new',
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
    };
    return cachedProfile;
  } catch {
    return { type: 'new', device: 'desktop' };
  }
}

export function usePersonalization() {
  const { locale } = useI18n();
  const profile = resolveProfile();
  const segment = computed(() => `${profile.type}:${profile.device}:${locale.value}`);
  return { segment };
}
