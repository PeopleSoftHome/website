import { Test, TestingModule } from '@nestjs/testing';
import { TokenCleanupService } from './token-cleanup.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('TokenCleanupService', () => {
  let service: TokenCleanupService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCleanupService,
        {
          provide: PrismaService,
          useValue: {
            tokenBlacklist: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) },
            refreshToken: { deleteMany: jest.fn().mockResolvedValue({ count: 5 }) },
          },
        },
      ],
    }).compile();

    service = module.get<TokenCleanupService>(TokenCleanupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should cleanup expired tokens', async () => {
    await service.cleanupExpiredTokens();
    expect(prisma.tokenBlacklist.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { expiresAt: { lt: expect.any(Date) } } }),
    );
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { expiresAt: { lt: expect.any(Date) } } }),
    );
  });
});
