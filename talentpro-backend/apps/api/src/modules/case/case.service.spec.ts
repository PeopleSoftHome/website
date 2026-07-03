import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { CaseService } from './case.service';
import { CaseStudyRepository } from './case-study.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('CaseService', () => {
  let service: CaseService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseService,
        CaseStudyRepository,
        {
          provide: PrismaService,
          useValue: {
            caseStudy: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CaseService>(CaseService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated published case studies', async () => {
      const mockCases = [
        { id: 'c1', slug: 'case-a', title: 'Case A', status: PostStatus.PUBLISHED, metrics: [{ label: 'Efficiency', value: '30%' }] },
      ];
      jest.spyOn(prisma.caseStudy, 'findMany').mockResolvedValue(mockCases as unknown as import('@prisma/client').CaseStudy[]);
      jest.spyOn(prisma.caseStudy, 'count').mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.caseStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.PUBLISHED, deletedAt: null }),
          skip: 0,
          take: 20,
          include: { metrics: true },
          orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }],
        }),
      );
      expect(result.data).toEqual(mockCases);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by industry and featured', async () => {
      const mockCases = [{ id: 'c1', slug: 'case-a', title: 'Case A', industry: 'tech', featured: true }];
      jest.spyOn(prisma.caseStudy, 'findMany').mockResolvedValue(mockCases as unknown as import('@prisma/client').CaseStudy[]);
      jest.spyOn(prisma.caseStudy, 'count').mockResolvedValue(1);

      const result = await service.findAll('tech', true, 1, 10);

      expect(prisma.caseStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PostStatus.PUBLISHED,
            deletedAt: null,
            industry: 'tech',
            featured: true,
          }),
          take: 10,
        }),
      );
      expect(result.meta.pageSize).toBe(10);
    });
  });

  describe('findBySlug', () => {
    it('should return case study and increment viewCount when found', async () => {
      const mockCase = { id: 'c1', slug: 'case-a', title: 'Case A', status: PostStatus.PUBLISHED, viewCount: 10, metrics: [] };
      jest.spyOn(prisma.caseStudy, 'findFirst').mockResolvedValue(mockCase as unknown as import('@prisma/client').CaseStudy);
      jest.spyOn(prisma.caseStudy, 'update').mockResolvedValue({ ...mockCase, viewCount: 11 } as unknown as import('@prisma/client').CaseStudy);

      const result = await service.findBySlug('case-a');

      expect(prisma.caseStudy.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'case-a', status: PostStatus.PUBLISHED, deletedAt: null },
          include: { metrics: true },
        }),
      );
      expect(prisma.caseStudy.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { viewCount: { increment: 1 } },
      });
      expect(result).toEqual(mockCase);
    });

    it('should throw NotFoundException when case study not found', async () => {
      jest.spyOn(prisma.caseStudy, 'findFirst').mockResolvedValue(null);

      await expect(service.findBySlug('not-found')).rejects.toThrow(NotFoundException);
      await expect(service.findBySlug('not-found')).rejects.toThrow('案例不存在');
    });
  });

  describe('findIndustries', () => {
    it('should return industry counts', async () => {
      const mockGroups = [
        { industry: 'tech', _count: { industry: 5 } },
        { industry: 'finance', _count: { industry: 2 } },
      ];
      jest.spyOn(prisma.caseStudy, 'groupBy').mockResolvedValue(mockGroups as never);

      const result = await service.findIndustries();

      expect(prisma.caseStudy.groupBy).toHaveBeenCalledWith({
        by: ['industry'],
        where: { status: PostStatus.PUBLISHED, deletedAt: null },
        _count: { industry: true },
      });
      expect(result).toEqual([
        { name: 'tech', count: 5 },
        { name: 'finance', count: 2 },
      ]);
    });
  });
});
