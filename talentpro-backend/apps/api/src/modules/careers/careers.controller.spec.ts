import { Test, TestingModule } from '@nestjs/testing';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

describe('CareersController', () => {
  let controller: CareersController;
  let careersService: CareersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareersController],
      providers: [
        {
          provide: CareersService,
          useValue: {
            findAll: jest.fn(),
            findDepartments: jest.fn(),
            findById: jest.fn(),
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CareersController>(CareersController);
    careersService = module.get<CareersService>(CareersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /careers', () => {
    it('should call careersService.findAll with parsed pagination', async () => {
      const mockResult = { data: [{ id: 'j1', title: 'Frontend' }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } };
      jest.spyOn(careersService, 'findAll').mockResolvedValue(mockResult as unknown as ReturnType<CareersService['findAll']>);

      const result = await controller.findAll('social', 'engineering', 'Beijing', '2', '10');

      expect(careersService.findAll).toHaveBeenCalledWith('social', 'engineering', 'Beijing', 2, 10);
      expect(result).toEqual(mockResult);
    });

    it('should use default pagination when query omitted', async () => {
      jest.spyOn(careersService, 'findAll').mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } as unknown as ReturnType<CareersService['findAll']>);

      await controller.findAll();

      expect(careersService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, 1, 20);
    });

    it('should clamp page and pageSize to at least 1', async () => {
      jest.spyOn(careersService, 'findAll').mockResolvedValue({ data: [], meta: { page: 1, pageSize: 1, total: 0, totalPages: 0 } } as unknown as ReturnType<CareersService['findAll']>);

      await controller.findAll(undefined, undefined, undefined, '0', '-5');

      expect(careersService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, 1, 1);
    });
  });

  describe('GET /careers/departments', () => {
    it('should call careersService.findDepartments', async () => {
      const mockDepartments = [{ name: 'engineering', count: 3 }];
      jest.spyOn(careersService, 'findDepartments').mockResolvedValue(mockDepartments as unknown as ReturnType<CareersService['findDepartments']>);

      const result = await controller.findDepartments();

      expect(careersService.findDepartments).toHaveBeenCalled();
      expect(result).toEqual(mockDepartments);
    });
  });

  describe('GET /careers/:id', () => {
    it('should call careersService.findById', async () => {
      const mockJob = { id: 'j1', title: 'Frontend Engineer' };
      jest.spyOn(careersService, 'findById').mockResolvedValue(mockJob as unknown as ReturnType<CareersService['findById']>);

      const result = await controller.findById('j1');

      expect(careersService.findById).toHaveBeenCalledWith('j1');
      expect(result).toEqual(mockJob);
    });
  });

  describe('POST /careers/:id/apply', () => {
    it('should call careersService.apply with id and dto', async () => {
      const mockApplication = { id: 'ja1', jobId: 'j1', name: 'Alice' };
      jest.spyOn(careersService, 'apply').mockResolvedValue(mockApplication as unknown as ReturnType<CareersService['apply']>);
      const dto: CreateJobApplicationDto = {
        name: 'Alice',
        email: 'alice@example.com',
        phone: '13800138000',
        resumeUrl: 'https://example.com/resume.pdf',
      };

      const result = await controller.apply('j1', dto);

      expect(careersService.apply).toHaveBeenCalledWith('j1', dto);
      expect(result).toEqual(mockApplication);
    });
  });
});
