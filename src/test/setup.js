import '@testing-library/jest-dom';
import { config } from '@vue/test-utils';

// Vue Test Utils 全局配置
config.global.stubs = {
  // 默认不 stub Teleport，让弹窗测试更真实
  teleport: false,
};
