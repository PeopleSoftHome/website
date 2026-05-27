/**
 * 共享内容审核工具函数
 * 供 CommentModerationService 和 SystemModerationService 复用
 */

export const SPAM_PATTERNS = [
  /(微信|vx|v信|薇信|加微)[：:]?\s*[\w-]+/gi,
  /(qq|QQ)[：:]?\s*\d{5,}/g,
  /(电话|联系方式|加我)[：:]?\s*\d{7,}/g,
  /(免费|优惠|促销|打折|代购|代理|加盟)/gi,
  /(http|https):\/\/[^\s]+/g,
];

export function checkSpamPatterns(content: string): { isSpam: boolean; spamFlags: string[] } {
  const flags: string[] = [];
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      flags.push('spam');
      break;
    }
  }
  return { isSpam: flags.length > 0, spamFlags: flags };
}

export function checkSuspiciousLength(content: string): { isSuspicious: boolean } {
  return { isSuspicious: content.length > 500 && /[a-zA-Z0-9]{20,}/.test(content) };
}

export function calculateRiskScore(
  sensitiveFlags: string[],
  spamFlags: string[],
  isSuspicious: boolean,
  severities: number[],
): { riskScore: number; flags: string[] } {
  let riskScore = 0;
  for (const sev of severities) {
    riskScore += sev * 0.25;
  }
  if (spamFlags.length > 0) riskScore += 0.3;
  if (isSuspicious) riskScore += 0.2;
  riskScore = Math.min(riskScore, 1);
  return {
    riskScore: Math.round(riskScore * 100) / 100,
    flags: [...new Set([...sensitiveFlags, ...spamFlags, ...(isSuspicious ? ['suspicious'] : [])])],
  };
}
