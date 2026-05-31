import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import ForumView from './forum/index.vue';
import { forumApi } from '@/api/forum.js';

vi.mock('@/api/forum.js', () => ({
  forumApi: {
    getTopics: vi.fn(),
    getCategories: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/ui/Avatar/Avatar.vue', () => ({
  default: { name: 'Avatar', props: ['name', 'size'], render: () => h('div') },
}));

vi.mock('@/components/ui/Skeleton/Skeleton.vue', () => ({
  default: { name: 'Skeleton', props: ['width', 'height'], render: () => h('div') },
}));

vi.mock('@/components/ui/Pagination/Pagination.vue', () => ({
  default: { name: 'Pagination', props: ['total', 'pageSize'], render: () => h('div') },
}));

const mockTopics = [
  {
    id: '1',
    title: 'Test Topic',
    isPinned: false,
    isLocked: false,
    viewCount: 10,
    replyCount: 5,
    category: { name: 'General' },
    author: { name: 'User1' },
    createdAt: new Date().toISOString(),
    _count: { posts: 5 },
  },
];

const mockCategories = [
  { id: '1', name: 'General' },
  { id: '2', name: 'Tech' },
];

function mountWithI18n(component, options = {}) {
  return mount(component, {
    global: {
      provide: {
        i18n: { t: (k) => k },
      },
      ...options.global,
    },
    ...options,
  });
}

describe('ForumView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    forumApi.getTopics.mockImplementation(() => new Promise(() => {}));
    forumApi.getCategories.mockImplementation(() => new Promise(() => {}));

    const wrapper = mountWithI18n(ForumView);
    await flushPromises();

    expect(wrapper.find('[class*="forumLoading"]').exists()).toBe(true);
  });

  it('should render topics after loading', async () => {
    forumApi.getTopics.mockResolvedValue({ data: mockTopics, meta: { total: 1 } });
    forumApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(ForumView);
    await flushPromises();

    expect(wrapper.find('[class*="topicList"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Topic');
  });

  it('should render error state on API failure', async () => {
    forumApi.getTopics.mockRejectedValue({ response: { data: { message: 'Server error' } } });
    forumApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(ForumView);
    await flushPromises();

    expect(wrapper.find('[class*="errorBox"]').exists()).toBe(true);
  });

  it('should render empty state when no topics', async () => {
    forumApi.getTopics.mockResolvedValue({ data: [], meta: { total: 0 } });
    forumApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(ForumView);
    await flushPromises();

    expect(wrapper.find('[class*="forumEmpty"]').exists()).toBe(true);
  });

  it('should render pinned and locked tags', async () => {
    const pinnedTopic = { ...mockTopics[0], isPinned: true, isLocked: true };
    forumApi.getTopics.mockResolvedValue({ data: [pinnedTopic], meta: { total: 1 } });
    forumApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(ForumView);
    await flushPromises();

    expect(wrapper.text()).toContain('forum.pinned');
    expect(wrapper.text()).toContain('forum.locked');
  });
});
