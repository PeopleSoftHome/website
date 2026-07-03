import { Test, TestingModule } from '@nestjs/testing';
import { ExperimentController } from './experiment.controller';
import { ExperimentService } from './experiment.service';
import { ExperimentStatus } from '@prisma/client';

describe('ExperimentController', () => {
  let controller: ExperimentController;
  let service: ExperimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperimentController],
      providers: [
        {
          provide: ExperimentService,
          useValue: {
            findAll: jest.fn(),
            findRunning: jest.fn(),
            findByKey: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
            recordEvent: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExperimentController>(ExperimentController);
    service = module.get<ExperimentService>(ExperimentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /experiments', () => {
    it('should return all experiments', async () => {
      const expected = [{ id: 'e1' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('GET /experiments/running', () => {
    it('should return running experiments', async () => {
      jest.spyOn(service, 'findRunning').mockResolvedValue([] as any);

      await controller.findRunning();

      expect(service.findRunning).toHaveBeenCalled();
    });
  });

  describe('GET /experiments/:key', () => {
    it('should return experiment by key', async () => {
      const expected = { id: 'e1', key: 'hero' };
      jest.spyOn(service, 'findByKey').mockResolvedValue(expected as any);

      const result = await controller.findByKey('hero');

      expect(service.findByKey).toHaveBeenCalledWith('hero');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /experiments', () => {
    it('should create an experiment', async () => {
      const dto = { key: 'hero', name: 'Hero', variantA: {}, variantB: {} };
      const expected = { id: 'e1', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /experiments/:id/status', () => {
    it('should update experiment status', async () => {
      const expected = { id: 'e1', status: ExperimentStatus.RUNNING };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(expected as any);

      const result = await controller.updateStatus('e1', { status: ExperimentStatus.RUNNING });

      expect(service.updateStatus).toHaveBeenCalledWith('e1', ExperimentStatus.RUNNING);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /experiments/:id/events', () => {
    it('should record an experiment event', async () => {
      const dto = { variant: 'A', eventType: 'impression', sessionId: 's1' };
      const expected = { id: 'ev1', experimentId: 'e1', ...dto };
      jest.spyOn(service, 'recordEvent').mockResolvedValue(expected as any);

      const result = await controller.recordEvent('e1', dto as any);

      expect(service.recordEvent).toHaveBeenCalledWith({ experimentId: 'e1', ...dto });
      expect(result).toEqual(expected);
    });
  });

  describe('GET /experiments/:id/stats', () => {
    it('should return experiment stats', async () => {
      const expected = { impressions: [], conversions: [] };
      jest.spyOn(service, 'getStats').mockResolvedValue(expected as any);

      const result = await controller.getStats('e1');

      expect(service.getStats).toHaveBeenCalledWith('e1');
      expect(result).toEqual(expected);
    });
  });
});
