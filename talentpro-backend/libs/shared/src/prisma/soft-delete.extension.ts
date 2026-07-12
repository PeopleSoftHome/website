/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma extension callbacks are inherently dynamic: args/query shapes vary per model.
import { Prisma } from '@prisma/client';

const SOFT_DELETE_MODELS = [
  'BlogPost',
  'ForumTopic',
  'ForumPost',
  'Comment',
  'User',
  'Resource',
  'CaseStudy',
  'Job',
  'News',
];

function injectSoftDelete(model: string, args: any) {
  if (!SOFT_DELETE_MODELS.includes(model) || !args || args.showDeleted) return args;
  return { ...args, where: { ...args.where, deletedAt: null } };
}

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
      async findMany({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async findUnique({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async findFirst({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async count({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async update({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async updateMany({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async delete({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async deleteMany({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
      async aggregate({ model, _operation, args, query }: any) {
        return query(injectSoftDelete(model, args));
      },
    },
  },
});
