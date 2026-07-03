import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DownloadService } from './download.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';

describe('DownloadService', () => {
  let service: DownloadService;
  let prisma: PrismaService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadService,
        {
          provide: PrismaService,
          useValue: {
            resource: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            downloadRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn((ops) => Promise.all(ops)),
          },
        },
        {
          provide: MailService,
          useValue: { send: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<DownloadService>(DownloadService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecord', () => {
    it('should create record, increment count and send email when fileUrl exists', async () => {
      const resource = { id: 'r1', title: 'Whitepaper', fileUrl: 'http://example.com/file.pdf' };
      const record = { id: 'd1', resourceId: 'r1', name: 'Alice', email: 'alice@example.com' };
      jest.spyOn(prisma.resource, 'findUnique').mockResolvedValue(resource as any);
      jest.spyOn(prisma.downloadRecord, 'create').mockResolvedValue(record as any);
      jest.spyOn(prisma.resource, 'update').mockResolvedValue({ ...resource, downloadCount: 1 } as any);

      const result = await service.createRecord({
        resourceId: 'r1',
        name: 'Alice',
        email: 'alice@example.com',
      });

      expect(prisma.resource.findUnique).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(prisma.downloadRecord.create).toHaveBeenCalledWith({
        data: { resourceId: 'r1', name: 'Alice', email: 'alice@example.com' },
      });
      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { downloadCount: { increment: 1 } },
      });
      expect(mailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: expect.stringContaining('Whitepaper'),
        }),
      );
      expect(result).toEqual({ record, fileUrl: resource.fileUrl });
    });

    it('should skip email when resource has no fileUrl', async () => {
      const resource = { id: 'r1', title: 'Whitepaper', fileUrl: null };
      const record = { id: 'd1', resourceId: 'r1', name: 'Alice', email: 'alice@example.com' };
      jest.spyOn(prisma.resource, 'findUnique').mockResolvedValue(resource as any);
      jest.spyOn(prisma.downloadRecord, 'create').mockResolvedValue(record as any);
      jest.spyOn(prisma.resource, 'update').mockResolvedValue(resource as any);

      await service.createRecord({ resourceId: 'r1', name: 'Alice', email: 'alice@example.com' });

      expect(mailService.send).not.toHaveBeenCalled();
    });

    it('should not throw when email sending fails', async () => {
      const resource = { id: 'r1', title: 'Whitepaper', fileUrl: 'http://example.com/file.pdf' };
      jest.spyOn(prisma.resource, 'findUnique').mockResolvedValue(resource as any);
      jest.spyOn(prisma.downloadRecord, 'create').mockResolvedValue({ id: 'd1' } as any);
      jest.spyOn(prisma.resource, 'update').mockResolvedValue(resource as any);
      jest.spyOn(mailService, 'send').mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.createRecord({ resourceId: 'r1', name: 'Alice', email: 'alice@example.com' }),
      ).resolves.toBeDefined();
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      jest.spyOn(prisma.resource, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createRecord({ resourceId: 'r1', name: 'Alice', email: 'alice@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRecords', () => {
    it('should return paginated records filtered by resourceId', async () => {
      const records = [{ id: 'd1' }];
      jest.spyOn(prisma.downloadRecord, 'findMany').mockResolvedValue(records as any);
      jest.spyOn(prisma.downloadRecord, 'count').mockResolvedValue(1);

      const result = await service.findRecords('r1', 1, 10);

      expect(prisma.downloadRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { resourceId: 'r1' },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.data).toEqual(records);
      expect(result.meta.total).toBe(1);
    });

    it('should return paginated records without resourceId filter', async () => {
      jest.spyOn(prisma.downloadRecord, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.downloadRecord, 'count').mockResolvedValue(0);

      const result = await service.findRecords(undefined, 2, 20);

      expect(prisma.downloadRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 20,
          take: 20,
        }),
      );
      expect(result.meta.total).toBe(0);
    });
  });
});
