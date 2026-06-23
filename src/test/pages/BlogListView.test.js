import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, provide, h } from 'vue';
import BlogListView from '@/pages/blog/index.vue';
import { blogApi } from '@/api/blog';

// Mock dependencies
vi.mock('@/api/blog', () => ({
  blogApi: {
    getPosts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/ui/Skeleton/Skeleton.vue', () => ({
  default: { name: 'Skeleton', props: ['width', 'height'], render: () => h('div') },
}));

vi.mock('@/components/ui/Pagination/Pagination.vue', () => ({
  default: { name: 'Pagination', props: ['total', 'pageSize'], render: () => h('div') },
}));

vi.mock('@/data/blog.js', () => ({
  BLOG_POSTS: [],
  BLOG_CATEGORIES: [],
}));

const mockPosts = [
  {
    id: '1',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'Test excerpt',
    content: 'Test content',
    coverImage: null,
    category: { name: 'Tech' },
    tags: [{ id: '1', name: 'Vue' }],
    createdAt: new Date().toISOString(),
  },
];

const mockCategories = [
  { id: '1', name: 'Tech' },
  { id: '2', name: 'HR' },
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

describe('BlogListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    blogApi.getPosts.mockImplementation(() => new Promise(() => {}));
    blogApi.getCategories.mockImplementation(() => new Promise(() => {}));

    const wrapper = mountWithI18n(BlogListView);
    await flushPromises();

    expect(wrapper.find('[class*="blogLoading"]').exists()).toBe(true);
  });

  it('should render posts after loading', async () => {
    blogApi.getPosts.mockResolvedValue({ data: mockPosts, meta: { total: 1 } });
    blogApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(BlogListView);
    await flushPromises();

    expect(wrapper.find('[class*="blogGrid"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Post');
  });

  it('should render error state on API failure', async () => {
    blogApi.getPosts.mockRejectedValue(new Error('Network error'));
    blogApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(BlogListView);
    await flushPromises();

    expect(wrapper.find('[class*="errorBox"]').exists()).toBe(true);
  });

  it('should render empty state when no posts', async () => {
    blogApi.getPosts.mockResolvedValue({ data: [], meta: { total: 0 } });
    blogApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(BlogListView);
    await flushPromises();

    expect(wrapper.find('[class*="blogEmpty"]').exists()).toBe(true);
  });

  it('should render category buttons', async () => {
    blogApi.getPosts.mockResolvedValue({ data: mockPosts, meta: { total: 1 } });
    blogApi.getCategories.mockResolvedValue({ data: mockCategories });

    const wrapper = mountWithI18n(BlogListView);
    await flushPromises();

    const buttons = wrapper.findAll('[class*="catBtn"]');
    expect(buttons.length).toBe(mockCategories.length);
  });
});
