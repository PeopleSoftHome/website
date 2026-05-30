import { Prisma } from '@prisma/client';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:';

/**
 * PII 字段级加密配置
 * 模型名 -> 需要加密的字段列表
 */
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ['phone', 'email'],
  DemoBooking: ['phone', 'email'],
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

function shouldEncryptField(model: string, field: string): boolean {
  return ENCRYPTED_FIELDS[model]?.includes(field) ?? false;
}

/**
 * Prisma Client 字段级加密扩展
 *
 * 使用方式：
 * 1. 设置 PII_ENCRYPTION_KEY 环境变量（32+ 字符）
 * 2. 在 PrismaService 中通过 $extends 应用此扩展
 *
 * 自动行为：
 * - create / update / upsert 时加密配置字段
 * - findUnique / findFirst / findMany 时解密配置字段
 * - 已加密值不会重复加密
 */
export function fieldEncryptionExtension(secret: string) {
  const key = deriveKey(secret);

  return Prisma.defineExtension({
    name: 'fieldEncryption',
    model: {
      $allModels: {
        async create({ model, operation, args, query }: any) {
          const encryptedArgs = encryptArgs(model, args, key);
          const result = await query(encryptedArgs);
          return decryptResult(model, result, key);
        },
        async createMany({ model, operation, args, query }: any) {
          const encryptedArgs = encryptManyArgs(model, args, key);
          return query(encryptedArgs);
        },
        async update({ model, operation, args, query }: any) {
          const encryptedArgs = encryptArgs(model, args, key);
          const result = await query(encryptedArgs);
          return decryptResult(model, result, key);
        },
        async updateMany({ model, operation, args, query }: any) {
          const encryptedArgs = encryptArgs(model, args, key);
          return query(encryptedArgs);
        },
        async upsert({ model, operation, args, query }: any) {
          const encryptedArgs = encryptUpsertArgs(model, args, key);
          const result = await query(encryptedArgs);
          return decryptResult(model, result, key);
        },
        async findUnique({ model, operation, args, query }: any) {
          const result = await query(args);
          return decryptResult(model, result, key);
        },
        async findFirst({ model, operation, args, query }: any) {
          const result = await query(args);
          return decryptResult(model, result, key);
        },
        async findMany({ model, operation, args, query }: any) {
          const results = await query(args);
          if (Array.isArray(results)) {
            return results.map((r) => decryptResult(model, r, key));
          }
          return results;
        },
      },
    },
  });

  function encryptValue(value: unknown): unknown {
    if (typeof value !== 'string' || !value) return value;
    if (isEncrypted(value)) return value; // 避免重复加密
    return encrypt(value, key);
  }

  function decryptValue(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    if (!isEncrypted(value)) return value;
    try {
      return decrypt(value, key);
    } catch {
      return value; // 解密失败返回原值（兼容历史数据）
    }
  }

  function encryptArgs(model: string, args: any, _key: Buffer): any {
    if (!args?.data) return args;
    const fields = ENCRYPTED_FIELDS[model];
    if (!fields) return args;

    const encryptedData = { ...args.data };
    for (const field of fields) {
      if (field in encryptedData && encryptedData[field] != null) {
        encryptedData[field] = encryptValue(encryptedData[field]);
      }
    }
    return { ...args, data: encryptedData };
  }

  function encryptManyArgs(model: string, args: any, _key: Buffer): any {
    if (!args?.data) return args;
    if (!Array.isArray(args.data)) return encryptArgs(model, args, _key);
    return { ...args, data: args.data.map((d: any) => encryptArgs(model, { data: d }, _key).data) };
  }

  function encryptUpsertArgs(model: string, args: any, _key: Buffer): any {
    const encrypted = { ...args };
    if (args.create) encrypted.create = encryptArgs(model, { data: args.create }, _key).data;
    if (args.update) encrypted.update = encryptArgs(model, { data: args.update }, _key).data;
    return encrypted;
  }

  function decryptResult(model: string, result: any, _key: Buffer): any {
    if (!result || typeof result !== 'object') return result;
    const fields = ENCRYPTED_FIELDS[model];
    if (!fields) return result;

    const decrypted = { ...result };
    for (const field of fields) {
      if (field in decrypted && decrypted[field] != null) {
        decrypted[field] = decryptValue(decrypted[field]);
      }
    }
    return decrypted;
  }
}
