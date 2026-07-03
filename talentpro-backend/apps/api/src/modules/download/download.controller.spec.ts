import { Test, TestingModule } from '@nestjs/testing';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('DownloadController', () => {
  let controller: DownloadController;
  let service: DownloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadController],
      providers: [
        {
          provide: DownloadService,
          useValue: {
            createRecord: jest.fn(),
            findRecords: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DownloadController>(DownloadController);
    service = module.get<DownloadService>(DownloadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /downloads', () => {
    it('should create a download record', async () => {
      const dto = { resourceId: 'r1', name: 'Alice', email: 'alice@example.com' };
      const expected = { record: { id: 'd1' }, fileUrl: 'http://example.com/file.pdf' };
      jest.spyOn(service, 'createRecord').mockResolvedValue(expected as any);

      const result = await controller.createRecord(dto as any);

      expect(service.createRecord).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /downloads', () => {
    it('should return records list with resourceId filter', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 10 };
      const expected = { data: [], meta: { total: 0 } };
      jest.spyOn(service, 'findRecords').mockResolvedValue(expected as any);

      const result = await controller.findRecords(pagination, 'r1');

      expect(service.findRecords).toHaveBeenCalledWith('r1', 1, 10);
      expect(result).toEqual(expected);
    });

    it('should return records list without resourceId filter', async () => {
      const pagination: PaginationDto = { page: 2, pageSize: 20 };
      const expected = { data: [], meta: { total: 0 } };
      jest.spyOn(service, 'findRecords').mockResolvedValue(expected as any);

      const result = await controller.findRecords(pagination, undefined);

      expect(service.findRecords).toHaveBeenCalledWith(undefined, 2, 20);
      expect(result).toEqual(expected);
    });
  });
});
