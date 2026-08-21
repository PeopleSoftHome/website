import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

export interface SignedUrlPayload {
  path: string;
  expiresAt: number;
}

@Injectable()
export class SignedUrlService {
  private readonly secret: string;
  private readonly defaultTtlSeconds: number;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('STORAGE_SIGNING_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('STORAGE_SIGNING_SECRET must be configured and at least 32 characters long');
    }
    this.secret = secret;
    this.defaultTtlSeconds = Math.min(Number(this.config.get('SIGNED_URL_TTL_SECONDS', 300)), 900);
  }

  sign(path: string, ttlSeconds = this.defaultTtlSeconds): SignedUrlPayload & { signature: string } {
    const expiresAt = Math.floor(Date.now() / 1000) + Math.min(Math.max(1, ttlSeconds), 900);
    return { path, expiresAt, signature: this.signature(path, expiresAt) };
  }

  verify(path: string, expiresAt: number, signature: string): boolean {
    if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
    const expected = Buffer.from(this.signature(path, expiresAt));
    const actual = Buffer.from(signature || '');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  assert(path: string, expiresAt: number, signature: string) {
    if (!this.verify(path, expiresAt, signature)) {
      throw new UnauthorizedException('Signed URL is invalid or expired');
    }
  }

  private signature(path: string, expiresAt: number) {
    return createHmac('sha256', this.secret)
      .update(`${path}:${expiresAt}`)
      .digest('hex');
  }
}
