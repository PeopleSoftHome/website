import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { WorkspaceStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async findMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });
    if (!user?.workspace) {
      throw new NotFoundException('您尚未加入任何工作空间');
    }
    return { workspace: user.workspace, role: user.workspaceRole };
  }

  async create(userId: string, data: { name: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });
    if (existing?.workspace) {
      throw new ConflictException('您已拥有一个工作空间');
    }

    const slug = await this.generateUniqueSlug(data.name);

    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug,
          ownerId: userId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { workspaceId: workspace.id, workspaceRole: 'OWNER' },
      });

      return workspace;
    });

    return result;
  }

  async update(userId: string, workspaceId: string, data: { name?: string; status?: WorkspaceStatus }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.workspaceId !== workspaceId) {
      throw new ForbiddenException('无权操作该工作空间');
    }
    if (user?.workspaceRole !== 'OWNER' && user?.workspaceRole !== 'ADMIN') {
      throw new ForbiddenException('需要管理员权限');
    }

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });
    return workspace;
  }

  async inviteMember(userId: string, workspaceId: string, inviteeEmail: string) {
    const inviter = await this.prisma.user.findUnique({ where: { id: userId } });
    if (inviter?.workspaceId !== workspaceId) {
      throw new ForbiddenException('无权操作该工作空间');
    }
    if (inviter?.workspaceRole !== 'OWNER' && inviter?.workspaceRole !== 'ADMIN') {
      throw new ForbiddenException('需要管理员权限');
    }

    const invitee = await this.prisma.user.findFirst({
      where: { email: inviteeEmail },
    });
    if (!invitee) {
      throw new NotFoundException('用户不存在');
    }
    if (invitee.workspaceId) {
      throw new ConflictException('该用户已加入其他工作空间');
    }

    await this.prisma.user.update({
      where: { id: invitee.id },
      data: { workspaceId, workspaceRole: 'MEMBER' },
    });

    return { message: '邀请成功' };
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
}
