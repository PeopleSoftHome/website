import { describe, it, expect } from 'vitest';
import { detectLocalAction, matchIntent, isDemoQuickReply, isHumanQuickReply } from './chatIntents';

describe('detectLocalAction', () => {
  it('演示相关关键词命中 demo', () => {
    expect(detectLocalAction('我想预约演示')).toBe('demo');
    expect(detectLocalAction('book a demo')).toBe('demo');
    expect(detectLocalAction('可以试用吗')).toBe('demo');
  });

  it('人工相关关键词命中 human', () => {
    expect(detectLocalAction('转人工')).toBe('human');
    expect(detectLocalAction('contact human agent')).toBe('human');
    expect(detectLocalAction('客服电话多少')).toBe('human');
  });

  it('无关输入返回 null', () => {
    expect(detectLocalAction('产品有哪些功能')).toBeNull();
    expect(detectLocalAction('')).toBeNull();
  });

  it('demo 优先级高于 human', () => {
    expect(detectLocalAction('预约人工演示')).toBe('demo');
  });
});

describe('matchIntent', () => {
  const intents = [
    { keywords: ['价格', 'pricing'], reply: '价格回复' },
    { keywords: ['部署'], reply: '部署回复' },
  ];

  it('命中首个匹配意图', () => {
    expect(matchIntent('价格怎么算', intents)?.reply).toBe('价格回复');
    expect(matchIntent('Pricing plan', intents)?.reply).toBe('价格回复');
  });

  it('未命中返回 null，异常输入不报错', () => {
    expect(matchIntent('你好', intents)).toBeNull();
    expect(matchIntent('测试', [{ keywords: null as unknown as string[] }])).toBeNull();
  });
});

describe('快捷回复判断', () => {
  it('isDemoQuickReply', () => {
    expect(isDemoQuickReply('预约演示')).toBe(true);
    expect(isDemoQuickReply('Book Demo')).toBe(true);
    expect(isDemoQuickReply('联系人工')).toBe(false);
  });

  it('isHumanQuickReply', () => {
    expect(isHumanQuickReply('联系人工客服')).toBe(true);
    expect(isHumanQuickReply('Talk to an agent')).toBe(true);
    expect(isHumanQuickReply('查看产品')).toBe(false);
  });
});
