import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button (Vue)', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } });
    expect(wrapper.text()).toBe('Click me');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button, { slots: { default: 'Click' } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies variant and size classes', () => {
    const wrapper = mount(Button, { props: { variant: 'ghost', size: 'sm' } });
    const classes = wrapper.find('button').classes();
    expect(classes.length).toBeGreaterThanOrEqual(3); // btn + variant + size
  });

  it('disables button', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
