/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma $extends query callbacks are inherently dynamic: args/query shapes vary per model.
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { hashEmail } from './email-hash.util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const PREFIX = 'enc:';

/**
 * PII 字段级加密配置
 * 模型名 -> 需要加密的字段列表
 *
 * 注：User.email / WorkspaceInvite.email 通过增加 HMAC-SHA256 hash 列支持等值查询。
 */
export const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ['phone', 'email'],
  WorkspaceInvite: ['email'],
  DemoBooking: ['phone', 'email'],
  DownloadRecord: ['email', 'phone'],
  JobApplication: ['email', 'phone', 'resumeUrl'],
  AppVendor: ['contactEmail', 'contactPhone'],
  TeamMember: ['email'],
};

/**
 * 需要额外维护 hash 索引列的字段映射
 * 模型名 -> { 原字段: hash 字段名 }
 */
const HASHED_FIELDS: Record<string, Record<string, string>> = {
  User: { email: 'emailHash' },
  WorkspaceInvite: { email: 'emailHash' },
};

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

function encrypt(value: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decrypt(value: string, key: Buffer): string {
  if (!value.startsWith(PREFIX)) return value;
  const payload = value.slice(PREFIX.length);
  const [ivB64, authTagB64, ciphertextB64] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function isEncrypted(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/**
 * Prisma Client 字段级加密扩展（query 扩展版）
 *
 * 使用 query 扩展而非 model 扩展，确保与 workspace/soft-delete 扩展组合时
 * 加解密逻辑仍然生效，且不会被后续扩展的 `query` 回调绕过。
 *
 * 自动行为：
 * - create / createMany / update / updateMany / upsert 时加密配置字段
 * - findUnique / findFirst / findMany 时解密配置字段
 * - 已加密值不会重复加密；解密失败时返回原值以兼容历史数据
 */
export function fieldEncryptionExtension(secret: string) {
  const key = deriveKey(secret);

  function encryptValue(value: unknown): unknown {
    if (typeof value !== 'string' || !value) return value;
    if (isEncrypted(value)) return value;
    return encrypt(value, key);
  }

  function decryptValue(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    if (!isEncrypted(value)) return value;
    try {
      return decrypt(value, key);
    } catch {
      return value;
    }
  }

  function encryptData(model: string, data: any): any {
    const fields = ENCRYPTED_FIELDS[model];
    if (!fields || !data || typeof data !== 'object') return data;

    const encrypted = { ...data };

    // 1) 先为需要 hash 索引的字段计算 HMAC（在加密前基于明文计算）
    const hashedFields = HASHED_FIELDS[model];
    if (hashedFields) {
      for (const [plainField, hashField] of Object.entries(hashedFields)) {
        if (plainField in encrypted && encrypted[plainField] != null && typeof encrypted[plainField] === 'string') {
          encrypted[hashField] = hashEmail(encrypted[plainField]);
        }
      }
    }

    // 2) 再加密 PII 字段
    for (const field of fields) {
      if (field in encrypted && encrypted[field] != null) {
        encrypted[field] = encryptValue(encrypted[field]);
      }
    }
    return encrypted;
  }

  function encryptArgs(model: string, args: any): any {
    if (!args || typeof args !== 'object') return args;
    if (args.data) {
      if (Array.isArray(args.data)) {
        args = { ...args, data: args.data.map((d: any) => encryptData(model, d)) };
      } else {
        args = { ...args, data: encryptData(model, args.data) };
      }
    }
    if (args.create) args = { ...args, create: encryptData(model, args.create) };
    if (args.update) args = { ...args, update: encryptData(model, args.update) };
    return args;
  }

  function decryptResult(model: string, result: any): any {
    const fields = ENCRYPTED_FIELDS[model];
    if (!fields || !result || typeof result !== 'object') return result;

    const decrypted = { ...result };
    for (const field of fields) {
      if (field in decrypted && decrypted[field] != null) {
        decrypted[field] = decryptValue(decrypted[field]);
      }
    }
    return decrypted;
  }

  return Prisma.defineExtension({
    name: 'fieldEncryption',
    query: {
      $allModels: {
        async create({ model, args, query }: any) {
          return decryptResult(model, await query(encryptArgs(model, args)));
        },
        async createMany({ model, args, query }: any) {
          return query(encryptArgs(model, args));
        },
        async createManyAndReturn({ model, args, query }: any) {
          const result = await query(encryptArgs(model, args));
          if (Array.isArray(result)) return result.map((r) => decryptResult(model, r));
          return decryptResult(model, result);
        },
        async update({ model, args, query }: any) {
          return decryptResult(model, await query(encryptArgs(model, args)));
        },
        async updateMany({ model, args, query }: any) {
          const result = await query(encryptArgs(model, args));
          if (Array.isArray(result)) return result.map((r) => decryptResult(model, r));
          return result;
        },
        async upsert({ model, args, query }: any) {
          return decryptResult(model, await query(encryptArgs(model, args)));
        },
        async findUnique({ model, args, query }: any) {
          return decryptResult(model, await query(args));
        },
        async findFirst({ model, args, query }: any) {
          return decryptResult(model, await query(args));
        },
        async findMany({ model, args, query }: any) {
          const results = await query(args);
          if (Array.isArray(results)) return results.map((r) => decryptResult(model, r));
          return results;
        },
      },
    },
  });
}
