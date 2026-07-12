import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { BaseCrudRepository } from '@shared/repositories/base-crud.repository';

/**
 * CMS 内容类型通用 Repository 工厂
 *
 * 通过 `forModel(modelName)` 动态创建指定模型的 BaseCrudRepository 实例，
 * 避免为每个 CMS 内容类型创建独立的 Repository 类。
 */
@Injectable()
export class CmsContentRepository {
  constructor(private prisma: PrismaService) {}

  forModel(modelName: string): BaseCrudRepository {
    return new BaseCrudRepository(this.prisma, modelName);
  }
}
