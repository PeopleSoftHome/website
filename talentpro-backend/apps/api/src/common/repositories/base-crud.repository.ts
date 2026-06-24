/* eslint-disable @typescript-eslint/no-explicit-any */
// Generic CRUD facade over Prisma dynamic models; concrete per-model typing lives in services.
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { getSkip, buildPaginatedResponse, PaginatedResult } from '@/common/helpers/pagination.helper';

export interface FindAllOptions {
  page?: number;
  pageSize?: number;
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export class BaseCrudRepository<T = any> {
  constructor(
    protected prisma: PrismaService,
    protected modelName: string,
  ) {}

  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 20, where, orderBy, include, select } = options;
    const skip = getSkip(page, pageSize);
    const findArgs: any = {
      skip,
      take: pageSize,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    };
    if (select) findArgs.select = select;
    else if (include) findArgs.include = include;
    const [data, total] = await Promise.all([
      this.model.findMany(findArgs),
      this.model.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findOne(id: string, include?: Record<string, any>, select?: Record<string, any>): Promise<T> {
    const findArgs: any = { where: { id } };
    if (select) findArgs.select = select;
    else if (include) findArgs.include = include;
    const item = await this.model.findUnique(findArgs);
    if (!item) throw new NotFoundException(`${this.modelName} 不存在`);
    return item;
  }

  async findBySlug(slug: string, include?: Record<string, any>, select?: Record<string, any>): Promise<T> {
    const findArgs: any = { where: { slug } };
    if (select) findArgs.select = select;
    else if (include) findArgs.include = include;
    const item = await this.model.findUnique(findArgs);
    if (!item) throw new NotFoundException(`${this.modelName} "${slug}" 不存在`);
    return item;
  }

  async create(data: Partial<T>, include?: Record<string, any>, select?: Record<string, any>): Promise<T> {
    const args: any = { data };
    if (select) args.select = select;
    else if (include) args.include = include;
    return this.model.create(args);
  }

  async update(id: string, data: Partial<T>, include?: Record<string, any>, select?: Record<string, any>): Promise<T> {
    const args: any = { where: { id }, data };
    if (select) args.select = select;
    else if (include) args.include = include;
    return this.model.update(args);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.model.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async upsert(where: Record<string, any>, update: Partial<T>, create: Partial<T>): Promise<T> {
    return this.model.upsert({ where, update, create });
  }
}
