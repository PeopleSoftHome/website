import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: { name: string; description?: string; permissionIds?: string[] }) {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds?.length
          ? { connect: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async update(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds
          ? { set: data.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Deleted successfully' };
  }
}
