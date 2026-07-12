/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma $extends query callbacks are inherently dynamic across all models.
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { workspaceStorage } from './workspace.storage';
import { softDeleteExtension } from './soft-delete.extension';
import { fieldEncryptionExtension } from './field-encryption.extension';

const WORKSPACE_MODELS = [
  'BlogPost',
  'ForumTopic',
  'ForumPost',
  'Comment',
  'DemoBooking',
  'Notification',
  'UserActivity',
  'Resource',
  'CaseStudy',
  'News',
  'Job',
  'DownloadRecord',
];

function applyWorkspaceFilter(args: any, workspaceId: string | null | undefined) {
  if (!workspaceId || !args) return args;
  return {
    ...args,
    where: { ...args.where, workspaceId },
  };
}

function shouldApplyWorkspaceFilter(model: string): boolean {
  return WORKSPACE_MODELS.includes(model);
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super();
    const piiKey = config.get<string>('PII_ENCRYPTION_KEY');
    if (!piiKey) {
      throw new Error(
        'PII_ENCRYPTION_KEY is required. ' +
        'Please set a secure encryption key (≥32 chars) in your environment variables.',
      );
    }
    const softDeleted = (this as any).$extends(softDeleteExtension);
    const encrypted = softDeleted.$extends(fieldEncryptionExtension(piiKey));
    const extended = encrypted.$extends({
      query: {
        $allModels: {
          async findMany({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async findUnique({ model, _operation, args, query }: any) {
            // findUnique 无法直接注入 workspaceId（Prisma 要求 where 只含唯一字段）
            // 但需保留 softDelete 的 deletedAt 过滤
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            const softDeletedArgs = {
              ...args,
              where: { ...args.where, deletedAt: null },
            };
            return query(softDeletedArgs);
          },
          async findFirst({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async count({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async update({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async updateMany({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async delete({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async deleteMany({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async upsert({ model, _operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
        },
      },
    });

    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'then') return undefined;
        if (prop in target) return (target as any)[prop];
        return (extended as any)[prop];
      },
    }) as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
