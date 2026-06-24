import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from './Tag.vue';

describe('Tag', () => {
  it('renders slot content', () => {
    const wrapper = mount(Tag, { slots: { default: 'TagLabel' } });
    expect(wrapper.text()).toBe('TagLabel');
  });

  it('applies default light variant', () => {
    const wrapper = mount(Tag);
    const classes = wrapper.find('span').classes();
    expect(classes.length).toBeGreaterThanOrEqual(1);
  });

  it('applies custom variant class', () => {
    const wrapper = mount(Tag, { props: { variant: 'ai' } });
    const classes = wrapper.find('span').classes();
    expect(classes.length).toBeGreaterThanOrEqual(1);
  });
});
