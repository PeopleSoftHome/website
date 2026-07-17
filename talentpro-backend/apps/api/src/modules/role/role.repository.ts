import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { BaseCrudRepository } from '@shared/repositories/base-crud.repository';

@Injectable()
export class RoleRepository extends BaseCrudRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'role');
  }

  // Role list is small and always returned as a plain array (no pagination).
  async findAllWithPermissions() {
    return this.model.findMany({ include: { permissions: true } });
  }
}
