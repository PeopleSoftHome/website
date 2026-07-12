/**
 * 可复用 Prisma 扩展
 * 实际实现位于 apps/api/src/common/prisma，此处 re-export 供跨项目复用识别。
 */
export { PrismaService } from '@/common/prisma/prisma.service';
export { createSoftDeleteExtension } from '@/common/prisma/soft-delete.extension';
export { createFieldEncryptionExtension } from '@/common/prisma/field-encryption.extension';
export { hashEmail } from '@/common/prisma/email-hash.util';
