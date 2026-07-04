import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { WorkspaceStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
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
      // Admin 工作空间页面把「未加入」视为空状态，返回 200 避免 404 报错
      return { workspace: null, role: user?.workspaceRole || null };
    }
    return { workspace: user.workspace, role: user.workspaceRole };
  }

  async create(userId: string, data: { name: string }) {
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
      throw new ForbiddenException('No permission to operate this workspace');
    }
    if (user?.workspaceRole !== 'OWNER' && user?.workspaceRole !== 'ADMIN') {
      throw new ForbiddenException('Admin permission required');
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
      throw new ForbiddenException('No permission to operate this workspace');
    }
    if (inviter?.workspaceRole !== 'OWNER' && inviter?.workspaceRole !== 'ADMIN') {
      throw new ForbiddenException('Admin permission required');
    }

    const invitee = await this.prisma.user.findFirst({
      where: { email: inviteeEmail },
    });

    // 被邀请人已注册：直接加入工作空间
    if (invitee) {
      if (invitee.workspaceId === workspaceId) {
        throw new ConflictException('This user is already a workspace member');
      }

      await this.prisma.user.update({
        where: { id: invitee.id },
        data: { workspaceId, workspaceRole: 'MEMBER' },
      });

      return { message: 'Invitation successful' };
    }

    // 被邀请人未注册：生成邀请码，注册时凭码加入
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        email: inviteeEmail,
        workspaceId,
        token,
        expiresAt,
      },
    });

    return {
      message: 'Invitation sent, waiting for user registration',
      inviteToken: invite.token,
      expiresAt: invite.expiresAt,
    };
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
