import { Prisma } from '@prisma/client';

const SOFT_DELETE_MODELS = [
  'BlogPost',
  'ForumTopic',
  'ForumPost',
  'Comment',
  'User',
  'Resource',
];

export const softDeleteExtension = Prisma.defineExtension({
  model: {
    $allModels: {
      async softDelete<T>(this: T, args: Prisma.Args<T, 'delete'>): Promise<Prisma.Result<T, typeof args, 'update'>> {
        const context = Prisma.getExtensionContext(this);
        const model = (context as any).$name;
        if (!SOFT_DELETE_MODELS.includes(model)) {
          throw new Error(`Model ${model} does not support soft delete`);
        }
        return (context as any).update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }: any) {
        if (SOFT_DELETE_MODELS.includes(model) && args && !args.showDeleted) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findUnique({ model, operation, args, query }: any) {
        if (SOFT_DELETE_MODELS.includes(model) && args && !args.showDeleted) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }: any) {
        if (SOFT_DELETE_MODELS.includes(model) && args && !args.showDeleted) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
      async count({ model, operation, args, query }: any) {
        if (SOFT_DELETE_MODELS.includes(model) && args && !args.showDeleted) {
          args.where = { ...args.where, deletedAt: null };
        }
        return query(args);
      },
    },
  },
});
