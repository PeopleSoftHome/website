import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { getSkip, buildPaginatedResponse } from '@shared/helpers/pagination.helper';

interface CmsModel {
  findMany: (args: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  count: (args: unknown) => Promise<number>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
}

interface PublishConfig {
  field: string;
  publishedValue: unknown;
}

/**
 * CMS 通用内容类型服务
 *
 * 通过 Prisma 动态模型访问，支持任意符合 CMS 内容类型规范的模型。
 * 内容类型模型需满足：
 * - 有 `id`, `slug` 字段
 * - 发布状态字段为 `status` / `isPublished` / `isActive` 之一
 */
@Injectable()
export class CmsGenericService {
  constructor(private prisma: PrismaService) {}

  private readonly publishConfigMap: Record<string, PublishConfig | undefined> = {
    product: { field: 'isPublished', publishedValue: true },
    industry: { field: 'isPublished', publishedValue: true },
    testimonial: { field: 'isActive', publishedValue: true },
    stat: { field: 'isActive', publishedValue: true },
    clientLogo: { field: 'isActive', publishedValue: true },
    whyUsTab: { field: 'isActive', publishedValue: true },
    aiCard: { field: 'isActive', publishedValue: true },
    resource: { field: 'status', publishedValue: 'PUBLISHED' },
  };

  private getModel(type: string): CmsModel {
    const model = (this.prisma as unknown as Record<string, CmsModel | undefined>)[type];
    if (!model) {
      throw new NotFoundException(`CMS content type "${type}" not found`);
    }
    return model;
  }

  private buildWhere(type: string, filters?: Record<string, unknown>): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    // Admin 传 status=all 时不加发布状态过滤
    if (filters?.status !== 'all') {
      const config = this.publishConfigMap[type];
      if (config) {
        where[config.field] = config.publishedValue;
      }
    }
    return where;
  }

  async findAll(type: string, page = 1, pageSize = 20, filters?: Record<string, unknown>) {
    const model = this.getModel(type);
    const skip = getSkip(page, pageSize);
    const where = this.buildWhere(type, filters);
    const [data, total] = await Promise.all([
      model.findMany({ skip, take: pageSize, where, orderBy: { sortOrder: 'asc' } }),
      model.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findBySlug(type: string, slug: string) {
    const model = this.getModel(type);
    const item = await model.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException(`${type} "${slug}" not found`);
    return item;
  }

  async create(type: string, data: Record<string, unknown>) {
    const model = this.getModel(type);
    return model.create({ data });
  }

  async update(type: string, id: string, data: Record<string, unknown>) {
    const model = this.getModel(type);
    return model.update({ where: { id }, data });
  }

  async delete(type: string, id: string) {
    const model = this.getModel(type);
    await model.delete({ where: { id } });
    return { message: 'Deleted successfully' };
  }
}
