import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

/**
 * CMS 通用内容类型服务
 *
 * 通过 Prisma 动态模型访问，支持任意符合 CMS 内容类型规范的模型。
 * 内容类型模型需满足：
 * - 有 `id`, `slug`, `title`, `status`, `createdAt`, `updatedAt` 字段
 * - `status` 支持 'PUBLISHED' | 'DRAFT'（可选）
 */
@Injectable()
export class CmsGenericService {
  constructor(private prisma: PrismaService) {}

  private getModel(type: string) {
    const model = (this.prisma as any)[type];
    if (!model) {
      throw new NotFoundException(`CMS 内容类型 "${type}" 不存在`);
    }
    return model;
  }

  async findAll(type: string, page = 1, pageSize = 20, filters?: Record<string, any>) {
    const model = this.getModel(type);
    const skip = getSkip(page, pageSize);
    const where: any = { status: 'PUBLISHED', ...filters };
    const [data, total] = await Promise.all([
      model.findMany({ skip, take: pageSize, where, orderBy: { sortOrder: 'asc' } }),
      model.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findBySlug(type: string, slug: string) {
    const model = this.getModel(type);
    const item = await model.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException(`${type} "${slug}" 不存在`);
    return item;
  }

  async create(type: string, data: any) {
    const model = this.getModel(type);
    return model.create({ data });
  }

  async update(type: string, id: string, data: any) {
    const model = this.getModel(type);
    return model.update({ where: { id }, data });
  }

  async delete(type: string, id: string) {
    const model = this.getModel(type);
    await model.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
