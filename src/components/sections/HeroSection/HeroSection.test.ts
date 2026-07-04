import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HeroSection from './HeroSection.vue';

vi.mock('@/stores/modal.pinia', () => ({
  useModalStore: vi.fn(() => ({ openModal: vi.fn() })),
}));

vi.mock('@/stores/videoModal.pinia', () => ({
  useVideoModalStore: vi.fn(() => ({ openVideo: vi.fn() })),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const mountHero = (props: Record<string, unknown> = {}) => {
    return mount(HeroSection, {
      props,
      global: {
        stubs: {
          NuxtImg: {
            props: ['src', 'alt'],
            template: '<img :src="src" :alt="alt" />',
          },
        },
      },
    });
  };

  it('falls back to i18n split title when no title prop is provided', () => {
    const wrapper = mountHero();
    const h1 = wrapper.find('h1');
    expect(h1.text()).toContain('hero.title1');
    expect(h1.text()).toContain('hero.titleAI');
    expect(h1.text()).toContain('hero.titleLine2');
  });

  it('renders custom title, subtitle, CTAs and background image from CMS config', () => {
    const wrapper = mountHero({
      title: 'Custom Hero Title',
      subtitle: 'Custom subtitle text',
      ctaPrimary: 'Custom Primary',
      ctaSecondary: 'Custom Secondary',
      backgroundImage: 'https://cdn.example.com/hero-bg.jpg',
      showDashboard: false,
    });

    expect(wrapper.find('h1').text()).toBe('Custom Hero Title');
    expect(wrapper.find('p').text()).toBe('Custom subtitle text');

    const buttons = wrapper.findAll('button');
    expect(buttons[0]?.text()).toBe('Custom Primary');
    expect(buttons[1]?.text()).toBe('Custom Secondary');

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://cdn.example.com/hero-bg.jpg');
    expect(img.attributes('alt')).toBe('');

    expect(wrapper.find('[class*="deviceFrame"]').exists()).toBe(false);
  });

  it('keeps dashboard visual visible by default', () => {
    const wrapper = mountHero();
    expect(wrapper.find('[class*="deviceFrame"]').exists()).toBe(true);
  });

  it('falls back to i18n for subtitle and CTAs when props are empty', () => {
    const wrapper = mountHero({ title: 'Only Title' });
    expect(wrapper.find('p').text()).toBe('hero.subtitle');
    const buttons = wrapper.findAll('button');
    expect(buttons[0]?.text()).toBe('hero.cta1');
    expect(buttons[1]?.text()).toBe('hero.cta2');
  });

  it('trims whitespace-only title and falls back to i18n', () => {
    const wrapper = mountHero({ title: '   ' });
    const h1 = wrapper.find('h1');
    expect(h1.text()).toContain('hero.title1');
  });

  it('hides dashboard visual when showDashboard is false', () => {
    const wrapper = mountHero({ showDashboard: false });
    expect(wrapper.find('[class*="deviceFrame"]').exists()).toBe(false);
  });

  it('does not render background image when backgroundImage is absent', () => {
    const wrapper = mountHero();
    expect(wrapper.findAll('img').length).toBe(0);
  });
});
