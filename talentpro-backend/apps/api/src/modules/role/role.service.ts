import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';

const ROLE_INCLUDE = { permissions: true };

@Injectable()
export class RoleService {
  constructor(private repo: RoleRepository) {}

  async findAll() {
    return this.repo.findAllWithPermissions();
  }

  async findOne(id: string) {
    return this.repo.findOne(id, ROLE_INCLUDE);
  }

  async create(data: { name: string; description?: string; permissionIds?: string[] }) {
    return this.repo.create(
      {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds?.length
          ? { connect: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      ROLE_INCLUDE,
    );
  }

  async update(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
    await this.findOne(id);
    return this.repo.update(
      id,
      {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? { set: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      ROLE_INCLUDE,
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
