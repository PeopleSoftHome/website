import { Test, TestingModule } from '@nestjs/testing';
import { MediaRepository } from './media.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('MediaRepository', () => {
  let repository: MediaRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaRepository,
        {
          provide: PrismaService,
          useValue: {
            media: {},
          } as unknown as PrismaService,
        },
      ],
    }).compile();

    repository = module.get<MediaRepository>(MediaRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should extend BaseCrudRepository with model name "media"', () => {
    expect((repository as any).modelName).toBe('media');
  });
});
