import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let health: HealthCheckService;

  const checkResult = { status: 'ok', info: {}, error: {}, details: {} };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue(checkResult),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockReturnValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockReturnValue({ memory_heap: { status: 'up' } }),
            checkRSS: jest.fn().mockReturnValue({ memory_rss: { status: 'up' } }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check();
      expect(health.check).toHaveBeenCalled();
      expect(result).toEqual(checkResult);
    });
  });

  describe('readiness', () => {
    it('should return readiness status', async () => {
      const result = await controller.readiness();
      expect(health.check).toHaveBeenCalled();
      expect(result).toEqual(checkResult);
    });
  });

  describe('liveness', () => {
    it('should return liveness status', async () => {
      const result = await controller.liveness();
      expect(health.check).toHaveBeenCalled();
      expect(result).toEqual(checkResult);
    });
  });
});
