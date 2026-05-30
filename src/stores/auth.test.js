import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createAuth } from './auth.js';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('@/api/client.js', () => ({
  apiClient: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
  },
}));

describe('createAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPost.mockReset();
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals?.();
  });

  it('returns auth state object', () => {
    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.auth.token).toBeDefined();
    expect(wrapper.vm.auth.user).toBeDefined();
    expect(wrapper.vm.auth.isLoggedIn).toBeDefined();
    expect(wrapper.vm.auth.login).toBeDefined();
    expect(wrapper.vm.auth.register).toBeDefined();
    expect(wrapper.vm.auth.logout).toBeDefined();
    expect(wrapper.vm.auth.fetchProfile).toBeDefined();
    expect(wrapper.vm.auth.refreshToken).toBeDefined();
  });

  it('isLoggedIn is false when no token/user', () => {
    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.auth.isLoggedIn.value).toBe(false);
  });

  it('login stores token and user', async () => {
    const mockUser = { id: 'u1', email: 'test@example.com', name: 'Test' };
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'atoken',
        refreshToken: 'rtoken',
        user: mockUser,
      },
    });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const user = await wrapper.vm.auth.login('test@example.com', 'password');

    expect(user).toEqual(mockUser);
    expect(wrapper.vm.auth.token.value).toBe('atoken');
    expect(wrapper.vm.auth.user.value).toEqual(mockUser);
    expect(wrapper.vm.auth.isLoggedIn.value).toBe(true);
    expect(localStorage.getItem('tp_access_token')).toBe('atoken');
    expect(localStorage.getItem('tp_refresh_token')).toBe('rtoken');
  });

  it('logout clears token and user', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        accessToken: 'atoken',
        refreshToken: 'rtoken',
        user: { id: 'u1' },
      },
    }).mockResolvedValueOnce({ data: { success: true } });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    await wrapper.vm.auth.login('a@b.com', 'pass');
    expect(wrapper.vm.auth.isLoggedIn.value).toBe(true);

    await wrapper.vm.auth.logout();

    expect(wrapper.vm.auth.token.value).toBe('');
    expect(wrapper.vm.auth.user.value).toBeNull();
    expect(wrapper.vm.auth.isLoggedIn.value).toBe(false);
    expect(localStorage.getItem('tp_access_token')).toBeNull();
  });

  it('register calls api with data', async () => {
    mockPost.mockResolvedValue({ data: { id: 'u2' } });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const payload = { email: 'new@example.com', password: 'Pass123!', name: 'New' };
    await wrapper.vm.auth.register(payload);

    expect(mockPost).toHaveBeenCalledWith('/auth/register', payload);
  });

  it('fetchProfile updates user', async () => {
    const mockUser = { id: 'u1', email: 'test@example.com' };
    mockGet.mockResolvedValue({ data: mockUser });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const user = await wrapper.vm.auth.fetchProfile();

    expect(user).toEqual(mockUser);
    expect(wrapper.vm.auth.user.value).toEqual(mockUser);
  });

  it('refreshToken exchanges refresh token for new access token', async () => {
    localStorage.setItem('tp_refresh_token', 'old_rt');
    mockPost.mockResolvedValue({
      data: { accessToken: 'new_at', refreshToken: 'new_rt' },
    });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const newToken = await wrapper.vm.auth.refreshToken();

    expect(newToken).toBe('new_at');
    expect(localStorage.getItem('tp_refresh_token')).toBe('new_rt');
  });

  it('login throws on missing accessToken', async () => {
    mockPost.mockResolvedValue({ data: {} });

    const comp = defineComponent({
      setup() {
        const auth = createAuth();
        return { auth };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    await expect(wrapper.vm.auth.login('a@b.com', 'pass')).rejects.toThrow('登录响应异常');
  });
});
