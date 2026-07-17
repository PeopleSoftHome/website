/**
 * chatIntents — ChatBot 意图识别纯函数层
 *
 * 从 useChatBot 抽出的无副作用逻辑：本地快速动作（demo/human）与
 * CMS 配置意图匹配，便于单测与复用。
 */

export interface ChatIntent {
  keywords: string[];
  reply?: string;
  quickReplies?: string[];
}

export type LocalAction = 'demo' | 'human' | null;

const LOCAL_ACTIONS: Record<'demo' | 'human', string[]> = {
  demo: ['演示', '预约', 'demo', 'book', 'trial', '试用', '体验'],
  human: ['人工', '客服', 'agent', 'human', 'service', '真人', '转人工'],
};

/** 检测用户输入是否命中本地快速动作（预约演示 / 转人工） */
export function detectLocalAction(text: string): LocalAction {
  const lower = text.toLowerCase();
  if (LOCAL_ACTIONS.demo.some((k) => lower.includes(k))) return 'demo';
  if (LOCAL_ACTIONS.human.some((k) => lower.includes(k))) return 'human';
  return null;
}

/** 在 CMS 配置的意图表中做关键词匹配，返回首个命中意图 */
export function matchIntent(text: string, intents: ChatIntent[]): ChatIntent | null {
  const lower = text.toLowerCase();
  for (const intent of intents) {
    if (Array.isArray(intent.keywords) && intent.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return intent;
    }
  }
  return null;
}

/** 快捷回复是否指向演示动作（打开预约弹窗） */
export function isDemoQuickReply(text: string): boolean {
  const lower = text.toLowerCase();
  return ['演示', 'demo', '预约', 'book'].some((k) => lower.includes(k));
}

/** 快捷回复是否指向转人工动作 */
export function isHumanQuickReply(text: string): boolean {
  const lower = text.toLowerCase();
  return ['人工', 'agent', 'human', '客服', 'service'].some((k) => lower.includes(k));
}
