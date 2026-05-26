import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SectionHeader from './SectionHeader.vue';

describe('SectionHeader', () => {
  it('renders title', () => {
    const wrapper = mount(SectionHeader, { props: { title: 'Hello' } });
    expect(wrapper.text()).toContain('Hello');
  });

  it('renders tag when provided', () => {
    const wrapper = mount(SectionHeader, { props: { title: 'Title', tag: 'New' } });
    expect(wrapper.text()).toContain('New');
  });

  it('renders subtitle when provided', () => {
    const wrapper = mount(SectionHeader, { props: { title: 'Title', subtitle: 'Desc' } });
    expect(wrapper.text()).toContain('Desc');
  });

  it('does not render tag when omitted', () => {
    const wrapper = mount(SectionHeader, { props: { title: 'Title' } });
    expect(wrapper.findComponent({ name: 'Tag' }).exists()).toBe(false);
  });
});
