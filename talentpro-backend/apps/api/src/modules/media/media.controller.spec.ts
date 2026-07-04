import { Test, TestingModule } from '@nestjs/testing';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            upload: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /medias', () => {
    it('should call mediaService.findAll with pagination and mimeType', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(mediaService, 'findAll').mockResolvedValue(mockResult as unknown as any);

      const pagination = { page: 2, pageSize: 10 } as PaginationDto;
      const result = await controller.findAll(pagination, 'image');

      expect(mediaService.findAll).toHaveBeenCalledWith(2, 10, 'image');
      expect(result).toEqual(mockResult);
    });

    it('should call mediaService.findAll without mimeType', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 20 } };
      jest.spyOn(mediaService, 'findAll').mockResolvedValue(mockResult as unknown as any);

      const pagination = { page: 1, pageSize: 20 } as PaginationDto;
      const result = await controller.findAll(pagination, undefined);

      expect(mediaService.findAll).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /medias/stats', () => {
    it('should call mediaService.getStats', async () => {
      const mockStats = { total: 10, byType: [] };
      jest.spyOn(mediaService, 'getStats').mockResolvedValue(mockStats as unknown as any);

      const result = await controller.getStats();

      expect(mediaService.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('GET /medias/:id', () => {
    it('should call mediaService.findOne with workspaceId when user present', async () => {
      const mockMedia = { id: 'm1' };
      jest.spyOn(mediaService, 'findOne').mockResolvedValue(mockMedia as unknown as any);

      const result = await controller.findOne('m1', { id: 'u1', workspaceId: 'ws1' } as any);

      expect(mediaService.findOne).toHaveBeenCalledWith('m1', 'ws1');
      expect(result).toEqual(mockMedia);
    });

    it('should call mediaService.findOne without workspaceId when user absent', async () => {
      const mockMedia = { id: 'm1' };
      jest.spyOn(mediaService, 'findOne').mockResolvedValue(mockMedia as unknown as any);

      const result = await controller.findOne('m1', undefined);

      expect(mediaService.findOne).toHaveBeenCalledWith('m1', undefined);
      expect(result).toEqual(mockMedia);
    });
  });

  describe('POST /medias/upload', () => {
    it('should call mediaService.upload with file and userId', async () => {
      const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
      const mockMedia = { id: 'm1' };
      jest.spyOn(mediaService, 'upload').mockResolvedValue(mockMedia as unknown as any);

      const result = await controller.upload('u1', mockFile);

      expect(mediaService.upload).toHaveBeenCalledWith(mockFile, 'u1');
      expect(result).toEqual(mockMedia);
    });

    it('should allow supported mime types via fileFilter', () => {
      const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, MediaController.prototype.upload) as any[];
      const interceptor = new interceptors[0]();
      const fileFilter = interceptor.multer.fileFilter;
      const cb = jest.fn();

      fileFilter({}, { mimetype: 'image/png' } as Express.Multer.File, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject unsupported mime types via fileFilter', () => {
      const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, MediaController.prototype.upload) as any[];
      const interceptor = new interceptors[0]();
      const fileFilter = interceptor.multer.fileFilter;
      const cb = jest.fn();

      fileFilter({}, { mimetype: 'text/plain' } as Express.Multer.File, cb);

      expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
    });
  });

  describe('POST /medias', () => {
    it('should call mediaService.create with dto and userId', async () => {
      const dto: CreateMediaDto = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        url: '/uploads/test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      };
      const mockMedia = { id: 'm1', ...dto, createdBy: 'u1' };
      jest.spyOn(mediaService, 'create').mockResolvedValue(mockMedia as unknown as any);

      const result = await controller.create('u1', dto);

      expect(mediaService.create).toHaveBeenCalledWith({ ...dto, createdBy: 'u1' });
      expect(result).toEqual(mockMedia);
    });
  });

  describe('PATCH /medias/:id', () => {
    it('should call mediaService.update with id, dto and workspaceId', async () => {
      const dto: UpdateMediaDto = { alt: 'alt text' };
      const mockMedia = { id: 'm1', alt: 'alt text' };
      jest.spyOn(mediaService, 'update').mockResolvedValue(mockMedia as unknown as any);

      const result = await controller.update('m1', { id: 'u1', workspaceId: 'ws1' } as any, dto);

      expect(mediaService.update).toHaveBeenCalledWith('m1', dto, 'ws1');
      expect(result).toEqual(mockMedia);
    });
  });

  describe('DELETE /medias/:id', () => {
    it('should call mediaService.delete with id and workspaceId', async () => {
      const mockResult = { message: 'Deleted successfully' };
      jest.spyOn(mediaService, 'delete').mockResolvedValue(mockResult as unknown as any);

      const result = await controller.delete('m1', { id: 'u1', workspaceId: 'ws1' } as any);

      expect(mediaService.delete).toHaveBeenCalledWith('m1', 'ws1');
      expect(result).toEqual(mockResult);
    });
  });
});
