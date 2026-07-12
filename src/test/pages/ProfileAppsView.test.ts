import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import ProfileAppsView from '@/pages/profile/apps.vue';
import { marketplaceApi } from '@/api/marketplace';

vi.mock('@/api/marketplace', () => ({
  marketplaceApi: {
    getMyApps: vi.fn(),
  },
}));

vi.mock('@/shared/utils/date', () => ({
  formatDate: vi.fn((date: string) => date),
}));

function mountWithI18n(component: unknown, options = {}) {
  return mount(component as never, {
    global: {
      provide: {
        i18n: { t: (k: string) => k },
      },
      stubs: {
        NuxtLink: { render: () => h('a') },
      },
      ...((options as Record<string, unknown>).global as Record<string, unknown> || {}),
    },
    ...(options as Record<string, unknown> || {}),
  });
}

describe('ProfileAppsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no apps', async () => {
    (marketplaceApi.getMyApps as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    const wrapper = mountWithI18n(ProfileAppsView);
    await flushPromises();

    expect(wrapper.text()).toContain('profile.noApps');
  });

  it('should render app list with status labels', async () => {
    const apps = [
      {
        id: 'sub-1',
        status: 'ACTIVE',
        tierName: 'Pro',
        amount: 199,
        pricingModel: 'RECURRING',
        interval: 'month',
        currentPeriodEnd: '2026-08-01',
        app: { name: 'Test App', slug: 'test-app', icon: '🚀' },
      },
    ];
    (marketplaceApi.getMyApps as ReturnType<typeof vi.fn>).mockResolvedValue({ data: apps });

    const wrapper = mountWithI18n(ProfileAppsView);
    await flushPromises();

    expect(wrapper.text()).toContain('Test App');
    expect(wrapper.text()).toContain('profile.subscriptionStatus.active');
  });
});
