import { Test, TestingModule } from '@nestjs/testing';
import { CmsContentRepository } from './cms-content.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('CmsContentRepository', () => {
  let repository: CmsContentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsContentRepository,
        {
          provide: PrismaService,
          useValue: {
            product: {},
            industry: {},
          },
        },
      ],
    }).compile();

    repository = module.get<CmsContentRepository>(CmsContentRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('forModel should return a BaseCrudRepository for the given model', () => {
    const result = repository.forModel('product');

    expect(result).toBeDefined();
    expect(typeof result.findAll).toBe('function');
    expect(typeof result.findBySlug).toBe('function');
    expect(typeof result.create).toBe('function');
    expect(typeof result.update).toBe('function');
    expect(typeof result.delete).toBe('function');
    expect(typeof result.upsert).toBe('function');
  });

  it('forModel should return a new repository instance for different models', () => {
    const productRepo = repository.forModel('product');
    const industryRepo = repository.forModel('industry');

    expect(productRepo).not.toBe(industryRepo);
  });
});
