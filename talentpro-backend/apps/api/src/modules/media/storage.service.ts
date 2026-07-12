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
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', path.join(process.cwd(), 'uploads'));
    this.baseUrl = this.configService.get<string>('STORAGE_BASE_URL', '/uploads');

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

    // 其他存储类型（S3/OSS）可在此扩展
    return this.uploadLocal(file, filename, originalName);
  }

  private async uploadLocal(
    file: Express.Multer.File,
    filename: string,
    originalName: string,
  ): Promise<UploadResult> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    const mimeType = file.mimetype;
    const size = file.size;
    const url = `${this.baseUrl}/${filename}`;

    let width: number | undefined;
    let height: number | undefined;
    let thumbUrl: string | undefined;
    let webpUrl: string | undefined;

    // 图片处理：获取尺寸 + 生成缩略图 + WebP
    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width;
        height = metadata.height;

        // 生成缩略图（最大 300x300）
        const thumbFilename = `thumb-${filename}`;
        const thumbPath = path.join(this.uploadDir, thumbFilename);
        await sharp(filePath)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .toFile(thumbPath);
        thumbUrl = `${this.baseUrl}/${thumbFilename}`;

        // 生成 WebP 版本（质量 85）
        const webpFilename = `${path.parse(filename).name}.webp`;
        const webpPath = path.join(this.uploadDir, webpFilename);
        await sharp(filePath)
          .webp({ quality: 85 })
          .toFile(webpPath);
        webpUrl = `${this.baseUrl}/${webpFilename}`;
      } catch (err) {
        this.logger.warn(`图片处理失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return {
      filename,
      originalName,
      url,
      webpUrl,
      mimeType,
      size,
      width,
      height,
      thumbUrl,
    };
  }

  async delete(filename: string): Promise<void> {
    if (this.storageType !== 'local') return;

    const filePath = path.join(this.uploadDir, filename);
    const thumbPath = path.join(this.uploadDir, `thumb-${filename}`);
    const webpPath = path.join(this.uploadDir, `${path.parse(filename).name}.webp`);

    try {
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      if (fs.existsSync(thumbPath)) await fs.promises.unlink(thumbPath);
      if (fs.existsSync(webpPath)) await fs.promises.unlink(webpPath);
    } catch (err) {
      this.logger.warn(`删除文件失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
