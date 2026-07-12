import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CareersService } from './careers.service';
import { JobRepository } from './job.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('CareersService', () => {
  let service: CareersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareersService,
        JobRepository,
        {
          provide: PrismaService,
          useValue: {
            job: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            jobApplication: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CareersService>(CareersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated open jobs', async () => {
      const mockJobs = [{ id: 'j1', title: 'Frontend Engineer', status: 'open', deletedAt: null }];
      jest.spyOn(prisma.job, 'findMany').mockResolvedValue(mockJobs as unknown as import('@prisma/client').Job[]);
      jest.spyOn(prisma.job, 'count').mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'open', deletedAt: null }),
          skip: 0,
          take: 20,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      );
      expect(result.data).toEqual(mockJobs);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by type, department and location', async () => {
      const mockJobs = [{ id: 'j1', title: 'Backend Engineer', status: 'open', deletedAt: null }];
      jest.spyOn(prisma.job, 'findMany').mockResolvedValue(mockJobs as unknown as import('@prisma/client').Job[]);
      jest.spyOn(prisma.job, 'count').mockResolvedValue(1);

      const result = await service.findAll('social', 'engineering', 'Beijing', 2, 10);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'open',
            deletedAt: null,
            type: 'social',
            department: 'engineering',
            location: { contains: 'Beijing', mode: 'insensitive' },
          }),
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.page).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return job when open and not deleted', async () => {
      const mockJob = { id: 'j1', title: 'Frontend Engineer', status: 'open', deletedAt: null };
      jest.spyOn(prisma.job, 'findUnique').mockResolvedValue(mockJob as unknown as import('@prisma/client').Job);

      const result = await service.findById('j1');

      expect(prisma.job.findUnique).toHaveBeenCalledWith({ where: { id: 'j1' } });
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException when job is closed', async () => {
      const mockJob = { id: 'j1', title: 'Old Job', status: 'closed', deletedAt: null };
      jest.spyOn(prisma.job, 'findUnique').mockResolvedValue(mockJob as unknown as import('@prisma/client').Job);

      await expect(service.findById('j1')).rejects.toThrow(NotFoundException);
      await expect(service.findById('j1')).rejects.toThrow('Job not found or closed');
    });

    it('should throw NotFoundException when job is deleted', async () => {
      const mockJob = { id: 'j1', title: 'Old Job', status: 'open', deletedAt: new Date() };
      jest.spyOn(prisma.job, 'findUnique').mockResolvedValue(mockJob as unknown as import('@prisma/client').Job);

      await expect(service.findById('j1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('apply', () => {
    it('should create job application when job is open', async () => {
      const mockJob = { id: 'j1', title: 'Frontend Engineer', status: 'open' };
      const mockApplication = { id: 'ja1', jobId: 'j1', name: 'Alice', email: 'alice@example.com' };
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(mockJob as unknown as import('@prisma/client').Job);
      jest.spyOn(prisma.jobApplication, 'create').mockResolvedValue(mockApplication as unknown as import('@prisma/client').JobApplication);

      const dto = { name: 'Alice', email: 'alice@example.com', phone: '13800138000', resumeUrl: 'https://example.com/resume.pdf' };
      const result = await service.apply('j1', dto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: 'j1', status: 'open' } });
      expect(prisma.jobApplication.create).toHaveBeenCalledWith({ data: { jobId: 'j1', ...dto } });
      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException when job does not exist or is closed', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.apply('j1', { name: 'Alice', email: 'alice@example.com' })).rejects.toThrow(NotFoundException);
      await expect(service.apply('j1', { name: 'Alice', email: 'alice@example.com' })).rejects.toThrow('Job not found or closed');
    });
  });

  describe('findDepartments', () => {
    it('should return department counts', async () => {
      const mockGroups = [
        { department: 'engineering', _count: { department: 3 } },
        { department: 'product', _count: { department: 1 } },
      ];
      jest.spyOn(prisma.job, 'groupBy').mockResolvedValue(mockGroups as never);

      const result = await service.findDepartments();

      expect(prisma.job.groupBy).toHaveBeenCalledWith({
        by: ['department'],
        where: { status: 'open', deletedAt: null },
        _count: { department: true },
      });
      expect(result).toEqual([
        { name: 'engineering', count: 3 },
        { name: 'product', count: 1 },
      ]);
    });
  });
});
