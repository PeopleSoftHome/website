import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

export interface UploadResult {
  filename: string;
  originalName: string;
  url: string;
  webpUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbUrl?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly storageType: string;

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    this.uploadDir = path.resolve(this.configService.get<string>('UPLOAD_DIR', path.join(process.cwd(), 'uploads')));

    if (this.storageType === 'local') {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}${ext}`;
    const originalName = file.originalname;

    if (this.storageType === 'local') {
      return this.uploadLocal(file, filename, originalName);
    }

    return this.uploadLocal(file, filename, originalName);
  }

  private async uploadLocal(
    file: Express.Multer.File,
    filename: string,
    originalName: string,
  ): Promise<UploadResult> {
    const filePath = this.resolveLocalPath(filename);
    await fs.promises.writeFile(filePath, file.buffer);

    const mimeType = file.mimetype;
    const size = file.size;
    const internalUrl = `storage://${filename}`;
    let width: number | undefined;
    let height: number | undefined;

    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width;
        height = metadata.height;

        const thumbFilename = `thumb-${filename}`;
        const thumbPath = this.resolveLocalPath(thumbFilename);
        await sharp(filePath)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .toFile(thumbPath);

        const webpFilename = `${path.parse(filename).name}.webp`;
        const webpPath = this.resolveLocalPath(webpFilename);
        await sharp(filePath).webp({ quality: 85 }).toFile(webpPath);
      } catch (err) {
        this.logger.warn(`图片处理失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { filename, originalName, url: internalUrl, mimeType, size, width, height };
  }

  resolveLocalPath(filename: string): string {
    if (path.basename(filename) !== filename || filename.includes('\\') || filename.includes('/')) {
      throw new Error('Invalid storage object key');
    }
    const resolved = path.resolve(this.uploadDir, filename);
    if (!resolved.startsWith(`${this.uploadDir}${path.sep}`)) {
      throw new Error('Invalid storage object key');
    }
    return resolved;
  }

  createReadStream(filename: string): fs.ReadStream {
    if (this.storageType !== 'local') {
      throw new Error('Local stream is unavailable for the configured storage backend');
    }
    return fs.createReadStream(this.resolveLocalPath(filename));
  }

  async stat(filename: string) {
    return fs.promises.stat(this.resolveLocalPath(filename));
  }

  async delete(filename: string): Promise<void> {
    if (this.storageType !== 'local') return;

    try {
      const filePath = this.resolveLocalPath(filename);
      const thumbPath = this.resolveLocalPath(`thumb-${filename}`);
      const webpPath = this.resolveLocalPath(`${path.parse(filename).name}.webp`);
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      if (fs.existsSync(thumbPath)) await fs.promises.unlink(thumbPath);
      if (fs.existsSync(webpPath)) await fs.promises.unlink(webpPath);
    } catch (err) {
      this.logger.warn(`删除文件失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
