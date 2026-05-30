import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BaseCrudRepository } from '@/common/repositories/base-crud.repository';

@Injectable()
export class JobRepository extends BaseCrudRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'job');
  }
}
