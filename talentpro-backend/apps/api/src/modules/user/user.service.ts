import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20) {
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true, email: true, name: true, phone: true,
          avatar: true, status: true, roleId: true, createdAt: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true,
        avatar: true, status: true, roleId: true, createdAt: true, updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword } as Prisma.UserUncheckedCreateInput,
      select: {
        id: true, email: true, name: true, phone: true,
        status: true, roleId: true, createdAt: true,
      },
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, email: true, name: true, phone: true,
        status: true, roleId: true, updatedAt: true,
      },
    });
    return user;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Deleted successfully' };
  }

  async search(q: string, limit = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: limit,
    });
    return { data: users };
  }
}
