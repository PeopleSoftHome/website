import { Test, TestingModule } from '@nestjs/testing';
import { ExperimentService } from './experiment.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { ExperimentStatus } from '@prisma/client';

describe('ExperimentService', () => {
  let service: ExperimentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperimentService,
        {
          provide: PrismaService,
          useValue: {
            experiment: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            experimentEvent: {
              create: jest.fn(),
              groupBy: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExperimentService>(ExperimentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all experiments ordered by createdAt desc', async () => {
      const experiments = [{ id: 'e1' }];
      jest.spyOn(prisma.experiment, 'findMany').mockResolvedValue(experiments as any);

      const result = await service.findAll();

      expect(prisma.experiment.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(experiments);
    });
  });

  describe('findRunning', () => {
    it('should return running experiments', async () => {
      jest.spyOn(prisma.experiment, 'findMany').mockResolvedValue([] as any);

      await service.findRunning();

      expect(prisma.experiment.findMany).toHaveBeenCalledWith({
        where: { status: ExperimentStatus.RUNNING },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByKey', () => {
    it('should return experiment by key', async () => {
      const experiment = { id: 'e1', key: 'hero' };
      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue(experiment as any);

      const result = await service.findByKey('hero');

      expect(prisma.experiment.findUnique).toHaveBeenCalledWith({ where: { key: 'hero' } });
      expect(result).toEqual(experiment);
    });
  });

  describe('create', () => {
    it('should create experiment with DRAFT status', async () => {
      const dto = {
        key: 'hero',
        name: 'Hero Experiment',
        variantA: { text: 'A' },
        variantB: { text: 'B' },
        trafficSplit: 50,
      };
      const created = { id: 'e1', ...dto, status: ExperimentStatus.DRAFT };
      jest.spyOn(prisma.experiment, 'create').mockResolvedValue(created as any);

      const result = await service.create(dto);

      expect(prisma.experiment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ExperimentStatus.DRAFT,
            variantA: dto.variantA,
            variantB: dto.variantB,
          }),
        }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('updateStatus', () => {
    it('should update experiment status', async () => {
      const updated = { id: 'e1', status: ExperimentStatus.RUNNING };
      jest.spyOn(prisma.experiment, 'update').mockResolvedValue(updated as any);

      const result = await service.updateStatus('e1', ExperimentStatus.RUNNING);

      expect(prisma.experiment.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: { status: ExperimentStatus.RUNNING },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('recordEvent', () => {
    it('should create an experiment event', async () => {
      const dto = {
        experimentId: 'e1',
        variant: 'A',
        eventType: 'impression',
        sessionId: 's1',
        properties: { foo: 'bar' },
      };
      const event = { id: 'ev1', ...dto };
      jest.spyOn(prisma.experimentEvent, 'create').mockResolvedValue(event as any);

      const result = await service.recordEvent(dto);

      expect(prisma.experimentEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          experimentId: 'e1',
          variant: 'A',
          eventType: 'impression',
          sessionId: 's1',
          properties: dto.properties,
        }),
      });
      expect(result).toEqual(event);
    });
  });

  describe('getStats', () => {
    it('should return impressions and conversions grouped by variant', async () => {
      jest
        .spyOn(prisma.experimentEvent, 'groupBy')
        .mockResolvedValueOnce([{ variant: 'A', _count: { variant: 10 } }] as any)
        .mockResolvedValueOnce([{ variant: 'A', _count: { variant: 2 } }] as any);

      const result = await service.getStats('e1');

      expect(prisma.experimentEvent.groupBy).toHaveBeenCalledTimes(2);
      expect(result.impressions).toEqual([{ variant: 'A', _count: { variant: 10 } }]);
      expect(result.conversions).toEqual([{ variant: 'A', _count: { variant: 2 } }]);
    });
  });

  describe('assign', () => {
    const running = {
      id: 'e1',
      key: 'cta-banner-copy',
      status: ExperimentStatus.RUNNING,
      trafficSplit: 0.5,
      variantA: { ctaText: '文案A' },
      variantB: { ctaText: '文案B' },
    };

    it('实验不存在 / 非 RUNNING / 无 sessionId 时返回 null', async () => {
      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue(null);
      expect(await service.assign('missing', 's1')).toBeNull();

      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue({ ...running, status: ExperimentStatus.DRAFT } as any);
      expect(await service.assign('cta-banner-copy', 's1')).toBeNull();

      expect(await service.assign('cta-banner-copy', '')).toBeNull();
    });

    it('同一会话分桶确定且曝光幂等（impression 只记一次）', async () => {
      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue(running as any);
      // 首次无曝光记录，之后记录已存在
      const findFirst = jest
        .spyOn(prisma.experimentEvent, 'findFirst')
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ id: 'ev1' } as any);
      const create = jest.spyOn(prisma.experimentEvent, 'create').mockResolvedValue({} as any);

      const first = await service.assign('cta-banner-copy', 'session-1');
      const second = await service.assign('cta-banner-copy', 'session-1');

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(first!.variant).toBe(second!.variant);
      expect(['A', 'B']).toContain(first!.variant);
      expect(create).toHaveBeenCalledTimes(1);

      await service.assign('cta-banner-copy', 'session-1');
      expect(create).toHaveBeenCalledTimes(1);
      expect(findFirst).toHaveBeenCalledTimes(3);
    });

    it('trafficSplit=1 全量 B 组，trafficSplit=0 全量 A 组', async () => {
      jest.spyOn(prisma.experimentEvent, 'findFirst').mockResolvedValue({ id: 'x' } as any);

      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue({ ...running, trafficSplit: 1 } as any);
      for (const s of ['s1', 's2', 's3', 's4', 's5']) {
        expect((await service.assign('cta-banner-copy', s))!.variant).toBe('B');
      }

      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue({ ...running, trafficSplit: 0 } as any);
      for (const s of ['s1', 's2', 's3', 's4', 's5']) {
        expect((await service.assign('cta-banner-copy', s))!.variant).toBe('A');
      }
    });

    it('返回当前变体对应的 config', async () => {
      jest.spyOn(prisma.experiment, 'findUnique').mockResolvedValue({ ...running, trafficSplit: 1 } as any);
      jest.spyOn(prisma.experimentEvent, 'findFirst').mockResolvedValue({ id: 'x' } as any);

      const result = await service.assign('cta-banner-copy', 's1');
      expect(result!.config).toEqual({ ctaText: '文案B' });
      expect(result!.experimentId).toBe('e1');
    });
  });
});
