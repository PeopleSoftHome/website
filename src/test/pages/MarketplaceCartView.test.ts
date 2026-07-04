import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import MarketplaceCartView from '@/pages/marketplace/cart.vue';
import { cartApi, paymentApi } from '@/api/marketplace';

vi.mock('@/api/marketplace', () => ({
  cartApi: {
    getCart: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  },
  paymentApi: {
    checkoutCart: vi.fn(),
  },
}));

vi.mock('@/utils/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/components/ui/Breadcrumb/Breadcrumb.vue', () => ({
  default: { name: 'Breadcrumb', props: ['items'], render: () => h('nav') },
}));

vi.mock('@/stores/auth.pinia', () => ({
  useAuthStore: () => ref({ isLoggedIn: true }).value,
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

describe('MarketplaceCartView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should render empty state when cart is empty', async () => {
    (cartApi.getCart as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items: [] } });

    const wrapper = mountWithI18n(MarketplaceCartView);
    await flushPromises();

    expect(wrapper.text()).toContain('marketplace.cartEmpty');
  });

  it('should render cart items and summary', async () => {
    const items = [
      { appId: 'a1', slug: 'app-1', name: 'App One', tierName: 'Pro', price: 100, currency: 'CNY', quantity: 2 },
    ];
    (cartApi.getCart as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items } });

    const wrapper = mountWithI18n(MarketplaceCartView);
    await flushPromises();

    expect(wrapper.text()).toContain('App One');
    expect(wrapper.text()).toContain('200.00');
  });

  it('should call checkout API and redirect on checkout', async () => {
    const items = [
      { appId: 'a1', slug: 'app-1', name: 'App One', tierName: 'Pro', price: 100, currency: 'CNY', quantity: 1 },
    ];
    (cartApi.getCart as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items } });
    (paymentApi.checkoutCart as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { url: 'https://pay.example.com' } });

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });

    const wrapper = mountWithI18n(MarketplaceCartView);
    await flushPromises();

    const checkoutBtn = wrapper.find('button[class*="checkout"]');
    await checkoutBtn.trigger('click');
    await flushPromises();

    expect(paymentApi.checkoutCart).toHaveBeenCalledWith({
      items: expect.arrayContaining([
        expect.objectContaining({ appId: 'a1', tierName: 'Pro', amount: 100 }),
      ]),
    });
    expect(window.location.href).toBe('https://pay.example.com');

    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });
});
