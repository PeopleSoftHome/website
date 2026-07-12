import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { BaseCrudRepository } from '@shared/repositories/base-crud.repository';

@Injectable()
export class BlogTagRepository extends BaseCrudRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'tag');
  }
}
