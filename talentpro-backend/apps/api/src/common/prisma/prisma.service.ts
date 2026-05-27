import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { workspaceStorage } from './workspace.storage';
import { softDeleteExtension } from './soft-delete.extension';

const WORKSPACE_MODELS = [
  'BlogPost',
  'ForumTopic',
  'ForumPost',
  'Comment',
  'DemoBooking',
  'Notification',
  'UserActivity',
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
  constructor() {
    super();
    const softDeleted = (this as any).$extends(softDeleteExtension);
    const extended = softDeleted.$extends({
      query: {
        $allModels: {
          async findMany({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async findUnique({ model, operation, args, query }: any) {
            // findUnique 要求 where 只含唯一字段，不注入 workspaceId
            // 由 Service 层在查询后自行校验 workspace 隔离
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(args);
          },
          async findFirst({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async count({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async update({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async updateMany({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async delete({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async deleteMany({ model, operation, args, query }: any) {
            if (!shouldApplyWorkspaceFilter(model)) return query(args);
            return query(applyWorkspaceFilter(args, workspaceStorage.getStore()));
          },
          async upsert({ model, operation, args, query }: any) {
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
