import { createHmac } from 'crypto';

const HMAC_KEY = process.env.PII_HMAC_KEY || process.env.PII_ENCRYPTION_KEY || '';

export function hashEmail(email: string): string {
  if (!HMAC_KEY) {
    throw new Error('PII_HMAC_KEY or PII_ENCRYPTION_KEY is required to compute email hash.');
  }
  return createHmac('sha256', HMAC_KEY).update(email.toLowerCase().trim()).digest('hex');
}
