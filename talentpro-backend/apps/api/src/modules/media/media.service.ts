import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private repo: MediaRepository,
    private storage: StorageService,
  ) {}

  async findAll(page = 1, pageSize = 20, mimeType?: string) {
    const where: any = {};
    if (mimeType) where.mimeType = { startsWith: mimeType };
    return this.repo.findAll({ page, pageSize, where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, workspaceId?: string) {
    const media = await this.repo.findOne(id);
    await this.checkWorkspaceAccess(media, workspaceId);
    return media;
  }

  async upload(file: Express.Multer.File, userId: string) {
    const result = await this.storage.upload(file);
    const media = await this.repo.create({
      filename: result.filename,
      originalName: result.originalName,
      url: result.url,
      webpUrl: result.webpUrl,
      thumbUrl: result.thumbUrl,
      mimeType: result.mimeType,
      size: result.size,
      width: result.width,
      height: result.height,
      alt: result.originalName,
      createdBy: userId,
    });
    return media;
  }

  async create(data: {
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    createdBy: string;
  }) {
    return this.repo.create(data);
  }

  async update(id: string, data: Partial<{ alt: string; originalName: string }>, workspaceId?: string) {
    await this.checkWorkspaceAccessById(id, workspaceId);
    return this.repo.update(id, data);
  }

  async delete(id: string, workspaceId?: string) {
    await this.checkWorkspaceAccessById(id, workspaceId);
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (media) {
      await this.storage.delete(media.filename);
    }
    return this.repo.delete(id);
  }

  async getStats() {
    const total = await this.prisma.media.count();
    const byType = await this.prisma.media.groupBy({
      by: ['mimeType'],
      _count: { mimeType: true },
      _sum: { size: true },
    });
    return { total, byType };
  }

  private async checkWorkspaceAccessById(id: string, workspaceId?: string) {
    if (!workspaceId) return;
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('媒体文件不存在');
    await this.checkWorkspaceAccess(media, workspaceId);
  }

  private async checkWorkspaceAccess(media: any, workspaceId?: string) {
    if (!workspaceId) return;
    const creator = await this.prisma.user.findUnique({
      where: { id: media.createdBy },
      select: { workspaceId: true },
    });
    if (creator?.workspaceId !== workspaceId) {
      throw new NotFoundException('媒体文件不存在或无权访问');
    }
  }
}
