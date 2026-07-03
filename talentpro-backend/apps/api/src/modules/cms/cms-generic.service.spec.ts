import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CmsGenericService } from './cms-generic.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as paginationHelper from '@/common/helpers/pagination.helper';

describe('CmsGenericService', () => {
  let service: CmsGenericService;
  let prisma: PrismaService;

  const createModelMock = () => ({
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsGenericService,
        {
          provide: PrismaService,
          useValue: {
            product: createModelMock(),
            productTab: createModelMock(),
            industry: createModelMock(),
            testimonial: createModelMock(),
            stat: createModelMock(),
            clientLogo: createModelMock(),
            whyUsTab: createModelMock(),
            aiCard: createModelMock(),
            resource: createModelMock(),
            resourceCategory: createModelMock(),
            caseStudy: createModelMock(),
            job: createModelMock(),
          },
        },
      ],
    }).compile();

    service = module.get<CmsGenericService>(CmsGenericService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated list with publish filter for known type', async () => {
      const data = [{ id: '1' }];
      const total = 1;
      (prisma.product.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.product.count as jest.Mock).mockResolvedValue(total);

      const result = await service.findAll('product', 1, 10);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual(paginationHelper.buildPaginatedResponse(data, 1, 10, total));
    });

    it('should use default page and pageSize', async () => {
      const data = [{ id: '1' }];
      (prisma.industry.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.industry.count as jest.Mock).mockResolvedValue(1);

      await service.findAll('industry');

      expect(prisma.industry.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should not apply publish filter when status is all', async () => {
      const data = [{ id: '1' }];
      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.testimonial.count as jest.Mock).mockResolvedValue(1);

      await service.findAll('testimonial', 2, 5, { status: 'all' });

      expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should apply status PUBLISHED filter for resource type', async () => {
      const data = [{ id: '1' }];
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.resource.count as jest.Mock).mockResolvedValue(1);

      await service.findAll('resource');

      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should apply isActive filter for types without publish config', async () => {
      const data = [{ id: '1' }];
      (prisma.stat.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.stat.count as jest.Mock).mockResolvedValue(1);

      await service.findAll('stat');

      expect(prisma.stat.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should not apply publish filter for unknown type', async () => {
      const data = [{ id: '1' }];
      (prisma.resourceCategory.findMany as jest.Mock).mockResolvedValue(data);
      (prisma.resourceCategory.count as jest.Mock).mockResolvedValue(1);

      await service.findAll('resourceCategory');

      expect(prisma.resourceCategory.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should throw NotFoundException when model does not exist', async () => {
      await expect(service.findAll('unknownType')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return item when found', async () => {
      const item = { id: '1', slug: 'home' };
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(item);

      const result = await service.findBySlug('product', 'home');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { slug: 'home' } });
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when item not found', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findBySlug('product', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when model does not exist', async () => {
      await expect(service.findBySlug('unknownType', 'slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create item with model', async () => {
      const data = { slug: 'new' };
      const created = { id: '1', ...data };
      (prisma.industry.create as jest.Mock).mockResolvedValue(created);

      const result = await service.create('industry', data);

      expect(prisma.industry.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when model does not exist', async () => {
      await expect(service.create('unknownType', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update item with model', async () => {
      const data = { title: 'updated' };
      const updated = { id: '1', ...data };
      (prisma.clientLogo.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update('clientLogo', '1', data);

      expect(prisma.clientLogo.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when model does not exist', async () => {
      await expect(service.update('unknownType', '1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete item and return message', async () => {
      (prisma.whyUsTab.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.delete('whyUsTab', '1');

      expect(prisma.whyUsTab.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ message: '删除成功' });
    });

    it('should throw NotFoundException when model does not exist', async () => {
      await expect(service.delete('unknownType', '1')).rejects.toThrow(NotFoundException);
    });
  });
});
