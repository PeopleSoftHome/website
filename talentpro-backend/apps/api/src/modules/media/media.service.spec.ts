import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';
import { NotFoundException } from '@nestjs/common';

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
      jest.spyOn(repo, 'findAll').mockResolvedValue(mockResult as any);

      const result = await service.findAll(1, 20);
      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should filter by mimeType', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(repo, 'findAll').mockResolvedValue(mockResult as any);

      await service.findAll(1, 20, 'image');
      expect(repo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ mimeType: { startsWith: 'image' } }),
        }),
      );
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
      jest.spyOn(repo, 'create').mockResolvedValue(mockMedia as any);

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
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue(mockMedia as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ workspaceId: 'ws1' } as any);
      jest.spyOn(storage, 'delete').mockResolvedValue(undefined);
      jest.spyOn(repo, 'delete').mockResolvedValue({ message: '删除成功' } as any);

      await service.delete('m1', 'ws1');

      expect(storage.delete).toHaveBeenCalledWith('test.jpg');
      expect(repo.delete).toHaveBeenCalledWith('m1');
    });

    it('should throw NotFoundException when media not found with workspace check', async () => {
      jest.spyOn(prisma.media, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('missing', 'ws1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return media stats', async () => {
      jest.spyOn(prisma.media, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.media, 'groupBy').mockResolvedValue([
        { mimeType: 'image/jpeg', _count: { mimeType: 5 }, _sum: { size: 5000 } },
      ] as any);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.byType).toHaveLength(1);
    });
  });
});
