import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';
import { NotFoundException } from '@nestjs/common';
import { Media, User } from '@prisma/client';
import { PaginatedResult } from '@shared/helpers/pagination.helper';

describe('MediaService', () => {
  let service: MediaService;
  let prisma: PrismaService;
  let repo: MediaRepository;
  let storage: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: {
            media: {
              findUnique: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MediaRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prisma = module.get<PrismaService>(PrismaService);
    repo = module.get<MediaRepository>(MediaRepository);
    storage = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated media list', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(repo, 'findAll').mockResolvedValue(mockResult as unknown as PaginatedResult<Media>);

      const result = await service.findAll(1, 20);
      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should filter by mimeType', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(repo, 'findAll').mockResolvedValue(mockResult as unknown as PaginatedResult<Media>);

      await service.findAll(1, 20, 'image');
      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ mimeType: { startsWith: 'image' } }),
        }),
      );
    });

    it('should use default pagination values', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(repo, 'findAll').mockResolvedValue(mockResult as unknown as PaginatedResult<Media>);

      await service.findAll();

      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return media without workspace check when workspaceId not provided', async () => {
      const mockMedia = { id: 'm1', createdBy: 'u1' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockMedia as unknown as Media);

      const result = await service.findOne('m1');

      expect(repo.findOne).toHaveBeenCalledWith('m1');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });

    it('should return media when workspace matches', async () => {
      const mockMedia = { id: 'm1', createdBy: 'u1' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockMedia as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws1' } as unknown as User);

      const result = await service.findOne('m1', 'ws1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
      expect(result).toEqual(mockMedia);
    });

    it('should throw NotFoundException when workspace does not match', async () => {
      const mockMedia = { id: 'm1', createdBy: 'u1' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockMedia as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws2' } as unknown as User);

      await expect(service.findOne('m1', 'ws1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create media record', async () => {
      const dto = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        url: '/uploads/test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      };
      const mockMedia = { id: 'm1', ...dto, createdBy: 'u1' };
      jest.spyOn(repo, 'create').mockResolvedValue(mockMedia as unknown as Media);

      const result = await service.create({ ...dto, createdBy: 'u1' });

      expect(repo.create).toHaveBeenCalledWith({ ...dto, createdBy: 'u1' });
      expect(result).toEqual(mockMedia);
    });
  });

  describe('update', () => {
    it('should update media without workspaceId', async () => {
      const mockMedia = { id: 'm1', alt: 'new alt' };
      jest.spyOn(repo, 'update').mockResolvedValue(mockMedia as unknown as Media);

      const result = await service.update('m1', { alt: 'new alt' });

      expect(repo.update).toHaveBeenCalledWith('m1', { alt: 'new alt' });
      expect(result).toEqual(mockMedia);
    });

    it('should update media when workspace matches', async () => {
      const mockMedia = { id: 'm1', alt: 'new alt' };
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue({ id: 'm1', createdBy: 'u1' } as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws1' } as unknown as User);
      jest.spyOn(repo, 'update').mockResolvedValue(mockMedia as unknown as Media);

      const result = await service.update('m1', { alt: 'new alt' }, 'ws1');

      expect(repo.update).toHaveBeenCalledWith('m1', { alt: 'new alt' });
      expect(result).toEqual(mockMedia);
    });

    it('should throw NotFoundException when updating media with mismatched workspace', async () => {
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue({ id: 'm1', createdBy: 'u1' } as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws2' } as unknown as User);

      await expect(service.update('m1', { alt: 'new alt' }, 'ws1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upload', () => {
    it('should upload file and create media record', async () => {
      const mockFile = { originalname: 'test.jpg', mimetype: 'image/jpeg', size: 1024 } as Express.Multer.File;
      const mockUploadResult = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        url: '/uploads/test.jpg',
        webpUrl: '/uploads/test.webp',
        thumbUrl: '/uploads/thumb-test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        width: 100,
        height: 100,
      };
      const mockMedia = { id: 'm1', ...mockUploadResult, createdBy: 'u1' };

      jest.spyOn(storage, 'upload').mockResolvedValue(mockUploadResult);
      jest.spyOn(repo, 'create').mockResolvedValue(mockMedia as unknown as Media);

      const result = await service.upload(mockFile, 'u1');

      expect(storage.upload).toHaveBeenCalledWith(mockFile);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.jpg',
          url: '/uploads/test.jpg',
          webpUrl: '/uploads/test.webp',
          thumbUrl: '/uploads/thumb-test.jpg',
          createdBy: 'u1',
        }),
      );
      expect(result).toEqual(mockMedia);
    });
  });

  describe('delete', () => {
    it('should delete media and storage file', async () => {
      const mockMedia = { id: 'm1', filename: 'test.jpg', createdBy: 'u1' };
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue(mockMedia as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws1' } as unknown as User);
      jest.spyOn(storage, 'delete').mockResolvedValue(undefined);
      jest.spyOn(repo, 'delete').mockResolvedValue({ message: 'Deleted successfully' } as unknown as { message: string });

      await service.delete('m1', 'ws1');

      expect(storage.delete).toHaveBeenCalledWith('test.jpg');
      expect(repo.delete).toHaveBeenCalledWith('m1');
    });

    it('should delete media without workspaceId and not call storage.delete when media not found', async () => {
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue(null);
      jest.spyOn(storage, 'delete').mockResolvedValue(undefined);
      jest.spyOn(repo, 'delete').mockResolvedValue({ message: 'Deleted successfully' } as unknown as { message: string });

      await service.delete('missing');

      expect(storage.delete).not.toHaveBeenCalled();
      expect(repo.delete).toHaveBeenCalledWith('missing');
    });

    it('should throw NotFoundException when media not found with workspace check', async () => {
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('missing', 'ws1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workspace does not match on delete', async () => {
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue({ id: 'm1', createdBy: 'u1' } as unknown as Media);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws2' } as unknown as User);

      await expect(service.delete('m1', 'ws1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return media stats', async () => {
      jest.spyOn(prisma.media, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.media, 'groupBy').mockResolvedValue([
        { mimeType: 'image/jpeg', _count: { mimeType: 5 }, _sum: { size: 5000 } },
      ] as unknown as any[]);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.byType).toHaveLength(1);
    });
  });
});
