import { Test, TestingModule } from '@nestjs/testing';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';

describe('CaseController', () => {
  let controller: CaseController;
  let caseService: CaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaseController],
      providers: [
        {
          provide: CaseService,
          useValue: {
            findAll: jest.fn(),
            findIndustries: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CaseController>(CaseController);
    caseService = module.get<CaseService>(CaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /cases', () => {
    it('should call caseService.findAll with parsed params', async () => {
      const mockResult = { data: [{ id: 'c1', title: 'Case A' }], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } };
      jest.spyOn(caseService, 'findAll').mockResolvedValue(mockResult as unknown as ReturnType<CaseService['findAll']>);

      const result = await controller.findAll('tech', 'true', '1', '10');

      expect(caseService.findAll).toHaveBeenCalledWith('tech', true, 1, 10);
      expect(result).toEqual(mockResult);
    });

    it('should pass undefined featured when query omitted', async () => {
      jest.spyOn(caseService, 'findAll').mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } as unknown as ReturnType<CaseService['findAll']>);

      await controller.findAll();

      expect(caseService.findAll).toHaveBeenCalledWith(undefined, undefined, 1, 20);
    });

    it('should parse featured=false correctly', async () => {
      jest.spyOn(caseService, 'findAll').mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } as unknown as ReturnType<CaseService['findAll']>);

      await controller.findAll(undefined, 'false');

      expect(caseService.findAll).toHaveBeenCalledWith(undefined, false, 1, 20);
    });
  });

  describe('GET /cases/industries', () => {
    it('should call caseService.findIndustries', async () => {
      const mockIndustries = [{ name: 'tech', count: 5 }];
      jest.spyOn(caseService, 'findIndustries').mockResolvedValue(mockIndustries as unknown as ReturnType<CaseService['findIndustries']>);

      const result = await controller.findIndustries();

      expect(caseService.findIndustries).toHaveBeenCalled();
      expect(result).toEqual(mockIndustries);
    });
  });

  describe('GET /cases/:slug', () => {
    it('should call caseService.findBySlug', async () => {
      const mockCase = { id: 'c1', slug: 'case-a', title: 'Case A' };
      jest.spyOn(caseService, 'findBySlug').mockResolvedValue(mockCase as unknown as ReturnType<CaseService['findBySlug']>);

      const result = await controller.findBySlug('case-a');

      expect(caseService.findBySlug).toHaveBeenCalledWith('case-a');
      expect(result).toEqual(mockCase);
    });
  });
});
