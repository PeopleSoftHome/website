import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

jest.mock('fs', () => {
  return {
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
      writeFile: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
    },
  };
});

jest.mock('sharp');

describe('StorageService', () => {
  let service: StorageService;
  const mockedFs = fs as jest.Mocked<typeof fs>;
  const mockedSharp = sharp as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(true);
  });

  const createService = async (configOverrides: Record<string, string> = {}) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              if (key in configOverrides) return configOverrides[key];
              if (key === 'UPLOAD_DIR') return path.join(process.cwd(), 'uploads');
              if (key === 'STORAGE_BASE_URL') return '/uploads';
              if (key === 'STORAGE_TYPE') return 'local';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    return { service };
  };

  describe('constructor', () => {
    it('should create upload directory when local storage and directory does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      await createService();

      expect(mockedFs.existsSync).toHaveBeenCalled();
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('should not create upload directory when local storage and directory exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      await createService();

      expect(mockedFs.existsSync).toHaveBeenCalled();
      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should not create upload directory when storage type is not local', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      await createService({ STORAGE_TYPE: 's3' });

      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('should upload image file locally with processed variants', async () => {
      await createService();
      const metadata = jest.fn().mockResolvedValue({ width: 800, height: 600 });
      const resize = jest.fn().mockReturnValue({ toFile: jest.fn().mockResolvedValue(undefined) });
      const webp = jest.fn().mockReturnValue({ toFile: jest.fn().mockResolvedValue(undefined) });
      mockedSharp.mockImplementation(() => ({
        metadata,
        resize,
        webp,
      }));

      const file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
        buffer: Buffer.from('file-content'),
      } as Express.Multer.File;

      const result = await service.upload(file);

      expect(mockedFs.promises.writeFile).toHaveBeenCalled();
      expect(metadata).toHaveBeenCalled();
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.url).toMatch(/\/uploads\/.*\.jpg/);
      expect(result.thumbUrl).toMatch(/thumb-/);
      expect(result.webpUrl).toMatch(/\.webp/);
    });

    it('should upload non-image file without image processing', async () => {
      await createService();

      const file = {
        originalname: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('pdf-content'),
      } as Express.Multer.File;

      const result = await service.upload(file);

      expect(mockedFs.promises.writeFile).toHaveBeenCalled();
      expect(mockedSharp).not.toHaveBeenCalled();
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(result.thumbUrl).toBeUndefined();
      expect(result.webpUrl).toBeUndefined();
    });

    it('should fallback to local upload when storage type is not local', async () => {
      await createService({ STORAGE_TYPE: 's3' });

      const file = {
        originalname: 'file.txt',
        mimetype: 'text/plain',
        size: 100,
        buffer: Buffer.from('text'),
      } as Express.Multer.File;

      const result = await service.upload(file);

      expect(mockedFs.promises.writeFile).toHaveBeenCalled();
      expect(result.mimeType).toBe('text/plain');
    });

    it('should handle sharp processing failure gracefully', async () => {
      await createService();
      mockedSharp.mockImplementation(() => ({
        metadata: jest.fn().mockRejectedValue(new Error('sharp error')),
      }));

      const file = {
        originalname: 'broken.jpg',
        mimetype: 'image/jpeg',
        size: 512,
        buffer: Buffer.from('broken'),
      } as Express.Multer.File;

      const result = await service.upload(file);

      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(result.thumbUrl).toBeUndefined();
      expect(result.webpUrl).toBeUndefined();
      expect(result.url).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete local files when they exist', async () => {
      await createService();
      mockedFs.existsSync.mockReturnValue(true);

      await service.delete('test.jpg');

      expect(mockedFs.promises.unlink).toHaveBeenCalledTimes(3);
    });

    it('should skip deleting local files when storage type is not local', async () => {
      await createService({ STORAGE_TYPE: 's3' });

      await service.delete('test.jpg');

      expect(mockedFs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should skip non-existent files during delete', async () => {
      await createService();
      mockedFs.existsSync.mockReturnValue(false);

      await service.delete('test.jpg');

      expect(mockedFs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should handle delete errors gracefully', async () => {
      await createService();
      mockedFs.existsSync.mockReturnValue(true);
      (mockedFs.promises.unlink as jest.Mock).mockRejectedValue(new Error('unlink error'));

      await expect(service.delete('test.jpg')).resolves.toBeUndefined();
    });
  });
});
