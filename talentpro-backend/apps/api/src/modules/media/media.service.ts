import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Prisma, Media } from '@prisma/client';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';
import { SignedUrlService } from './signed-url.service';
import { assertMediaSignature } from './file-signature';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private repo: MediaRepository,
    private storage: StorageService,
    private signedUrls: SignedUrlService,
  ) {}

  async findAll(page = 1, pageSize = 20, mimeType?: string) {
    const where: Prisma.MediaWhereInput = {};
    if (mimeType) where.mimeType = { startsWith: mimeType };
    return this.repo.findAll({ page, pageSize, where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, workspaceId?: string) {
    const media = await this.repo.findOne(id);
    await this.checkWorkspaceAccess(media, workspaceId);
    return media;
  }

  async createSignedUrl(id: string, workspaceId?: string, ttlSeconds?: number) {
    const media = await this.repo.findOne(id);
    await this.checkWorkspaceAccess(media, workspaceId);
    const signed = this.signedUrls.sign(media.filename, ttlSeconds);
    return {
      mediaId: media.id,
      expiresAt: signed.expiresAt,
      url: `/api/v1/medias/file/${encodeURIComponent(media.filename)}?exp=${signed.expiresAt}&sig=${signed.signature}`,
    };
  }

  async upload(file: Express.Multer.File, userId: string) {
    assertMediaSignature(file.buffer, file.mimetype);
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

  async createFromBuffer(data: {
    buffer: Buffer;
    filename?: string;
    originalName?: string;
    mimeType: string;
    alt?: string;
    createdBy: string;
  }) {
    assertMediaSignature(data.buffer, data.mimeType);
    const originalName = data.originalName || data.filename || `ai-generated-${Date.now()}.png`;
    const file: Express.Multer.File = {
      buffer: data.buffer,
      originalname: originalName,
      mimetype: data.mimeType,
      size: data.buffer.length,
    } as Express.Multer.File;

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
      alt: data.alt || result.originalName,
      createdBy: data.createdBy,
    });
    return media;
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
    if (!media) throw new NotFoundException('Media file not found');
    await this.checkWorkspaceAccess(media, workspaceId);
  }

  private async checkWorkspaceAccess(media: Pick<Media, 'createdBy'>, workspaceId?: string) {
    if (!workspaceId) return;
    const creator = await this.prisma.user.findUnique({
      where: { id: media.createdBy },
      select: { workspaceId: true },
    });
    if (creator?.workspaceId !== workspaceId) {
      throw new NotFoundException('Media file not found or no access');
    }
  }
}
