import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TabNav from './TabNav.vue';

const TABS = [
  { id: 'a', label: 'Tab A' },
  { id: 'b', label: 'Tab B' },
  { id: 'c', label: 'Tab C' },
];

describe('TabNav', () => {
  it('renders all tabs', () => {
    const wrapper = mount(TabNav, { props: { tabs: TABS, activeIndex: 0 } });
    expect(wrapper.findAll('button').length).toBe(3);
  });

  it('marks active tab with aria-selected', () => {
    const wrapper = mount(TabNav, { props: { tabs: TABS, activeIndex: 1 } });
    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('aria-selected')).toBe('false');
    expect(buttons[1].attributes('aria-selected')).toBe('true');
  });

  it('emits select event on click', async () => {
    const wrapper = mount(TabNav, { props: { tabs: TABS, activeIndex: 0 } });
    await wrapper.findAll('button')[2].trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')[0]).toEqual([2]);
  });

  it('has role tablist', () => {
    const wrapper = mount(TabNav, { props: { tabs: TABS, activeIndex: 0 } });
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
  });
});
