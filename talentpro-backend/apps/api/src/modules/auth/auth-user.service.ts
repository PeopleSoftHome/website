import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuthUserService {
  constructor(private prisma: PrismaService) {}

  async register(dto: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    company?: string;
    inviteToken?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });

    // 如果携带邀请码，加入现有工作空间
    if (dto.inviteToken) {
      const invite = await this.prisma.workspaceInvite.findUnique({
        where: { token: dto.inviteToken },
      });
      if (!invite || invite.email !== dto.email || invite.usedAt || invite.expiresAt < new Date()) {
        throw new BadRequestException('邀请码无效或已过期');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            phone: dto.phone,
            roleId: defaultRole?.id || '',
            workspaceId: invite.workspaceId,
            workspaceRole: 'MEMBER',
          },
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            createdAt: true,
            workspaceId: true,
            workspaceRole: true,
          },
        });

        await tx.workspaceInvite.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        });

        return { user };
      });

      return {
        message: '注册成功',
        user: result.user,
      };
    }

    // 默认行为：创建新工作空间并成为 OWNER
    const baseName = dto.company || dto.name || dto.email.split('@')[0];
    const slug = await this.generateUniqueSlug(baseName);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          phone: dto.phone,
          roleId: defaultRole?.id || '',
        },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          createdAt: true,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: baseName,
          slug,
          ownerId: user.id,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          workspaceId: workspace.id,
          workspaceRole: 'OWNER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          createdAt: true,
          workspaceId: true,
          workspaceRole: true,
        },
      });

      return { user: updatedUser };
    });

    return {
      message: '注册成功',
      user: result.user,
    };
  }

  private generateInviteToken(): string {
    return randomUUID();
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const slugify = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '').substring(0, 30);
    let slug = slugify(base) || 'workspace';
    let existing = await this.prisma.workspace.findUnique({ where: { slug } });
    let suffix = 1;
    while (existing) {
      slug = `${slugify(base)}-${suffix}`;
      existing = await this.prisma.workspace.findUnique({ where: { slug } });
      suffix++;
    }
    return slug;
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { role: true, workspace: true },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号已被禁用');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        workspaceId: user.workspaceId,
        workspaceRole: user.workspaceRole,
        workspaceName: user.workspace?.name,
      },
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        status: true,
        role: { select: { id: true, name: true, permissions: { select: { resource: true, action: true } } } },
        workspaceId: true,
        workspaceRole: true,
        workspace: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: { name?: string; avatar?: string; phone?: string; bio?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
    return { message: '更新成功', user };
  }
}
