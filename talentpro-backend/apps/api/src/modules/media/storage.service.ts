import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  private readonly bucket?: string;
  private readonly client?: S3Client;

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local').toLowerCase();
    this.uploadDir = path.resolve(this.configService.get<string>('UPLOAD_DIR', path.join(process.cwd(), 'uploads')));

    if (this.storageType === 's3' || this.storageType === 'oss') {
      this.bucket = this.configService.get<string>('STORAGE_BUCKET');
      if (!this.bucket) throw new Error('STORAGE_BUCKET is required when STORAGE_TYPE is s3/oss');
      this.client = new S3Client({
        region: this.configService.get<string>('STORAGE_REGION', 'us-east-1'),
        endpoint: this.configService.get<string>('STORAGE_ENDPOINT') || undefined,
        forcePathStyle: this.configService.get<boolean>('STORAGE_FORCE_PATH_STYLE', false),
        credentials: {
          accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY_ID', ''),
          secretAccessKey: this.configService.get<string>('STORAGE_SECRET_ACCESS_KEY', ''),
        },
      });
      if (!this.configService.get<string>('STORAGE_ACCESS_KEY_ID') || !this.configService.get<string>('STORAGE_SECRET_ACCESS_KEY')) {
        throw new Error('Object storage credentials are required for production storage');
      }
    } else {
      if (this.configService.get<string>('APP_ENV', 'development') === 'production') {
        throw new Error('Production requires STORAGE_TYPE=s3 or STORAGE_TYPE=oss; local filesystem storage is not supported');
      }
      if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}${ext}`;
    const originalName = file.originalname;
    return this.isObjectStorage() ? this.uploadObject(file, filename, originalName) : this.uploadLocal(file, filename, originalName);
  }

  async createSignedDownloadUrl(filename: string, ttlSeconds: number) {
    const safe = path.basename(filename) === filename && !filename.includes('/') && !filename.includes('\\');
    if (!safe) throw new Error('Invalid storage object key');
    if (this.isObjectStorage()) {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: filename });
      return getSignedUrl(this.client!, command, { expiresIn: Math.min(900, Math.max(1, ttlSeconds)) });
    }
    return null;
  }

  private isObjectStorage() {
    return this.storageType === 's3' || this.storageType === 'oss';
  }

  private async uploadObject(file: Express.Multer.File, filename: string, originalName: string): Promise<UploadResult> {
    await this.client!.send(new PutObjectCommand({ Bucket: this.bucket, Key: filename, Body: file.buffer, ContentType: file.mimetype }));

    let width: number | undefined;
    let height: number | undefined;
    let thumbUrl: string | undefined;
    let webpUrl: string | undefined;

    if (file.mimetype.startsWith('image/')) {
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        width = metadata.width;
        height = metadata.height;

        const thumbFilename = `thumb-${filename}`;
        const thumbBuffer = await image.clone().resize(300, 300, { fit: 'inside', withoutEnlargement: true }).toBuffer();
        await this.client!.send(new PutObjectCommand({ Bucket: this.bucket, Key: thumbFilename, Body: thumbBuffer, ContentType: file.mimetype }));
        thumbUrl = `storage://${thumbFilename}`;

        const webpFilename = `${path.parse(filename).name}.webp`;
        const webpBuffer = await image.clone().webp({ quality: 85 }).toBuffer();
        await this.client!.send(new PutObjectCommand({ Bucket: this.bucket, Key: webpFilename, Body: webpBuffer, ContentType: 'image/webp' }));
        webpUrl = `storage://${webpFilename}`;
      } catch (err) {
        this.logger.warn(`图片处理失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { filename, originalName, url: `storage://${filename}`, webpUrl, thumbUrl, mimeType: file.mimetype, size: file.size, width, height };
  }

  private async uploadLocal(file: Express.Multer.File, filename: string, originalName: string): Promise<UploadResult> {
    const filePath = this.resolveLocalPath(filename);
    await fs.promises.writeFile(filePath, file.buffer);
    const mimeType = file.mimetype;
    const size = file.size;
    let width: number | undefined;
    let height: number | undefined;

    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width;
        height = metadata.height;
        const thumbFilename = `thumb-${filename}`;
        const thumbPath = this.resolveLocalPath(thumbFilename);
        await sharp(filePath).resize(300, 300, { fit: 'inside', withoutEnlargement: true }).toFile(thumbPath);
        const webpFilename = `${path.parse(filename).name}.webp`;
        const webpPath = this.resolveLocalPath(webpFilename);
        await sharp(filePath).webp({ quality: 85 }).toFile(webpPath);
      } catch (err) {
        this.logger.warn(`图片处理失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { filename, originalName, url: `storage://${filename}`, mimeType, size, width, height };
  }

  resolveLocalPath(filename: string): string {
    if (path.basename(filename) !== filename || filename.includes('\\') || filename.includes('/')) throw new Error('Invalid storage object key');
    const resolved = path.resolve(this.uploadDir, filename);
    if (!resolved.startsWith(`${this.uploadDir}${path.sep}`)) throw new Error('Invalid storage object key');
    return resolved;
  }

  async createReadStream(filename: string): Promise<NodeJS.ReadableStream> {
    if (this.isObjectStorage()) {
      const object = await this.client!.send(new GetObjectCommand({ Bucket: this.bucket, Key: filename }));
      if (!object.Body) throw new Error('Media object body is empty');
      return object.Body as NodeJS.ReadableStream;
    }
    return fs.createReadStream(this.resolveLocalPath(filename));
  }

  async stat(filename: string) {
    if (this.isObjectStorage()) {
      const result = await this.client!.send(new HeadObjectCommand({ Bucket: this.bucket, Key: filename }));
      return { size: result.ContentLength || 0 };
    }
    return fs.promises.stat(this.resolveLocalPath(filename));
  }

  async delete(filename: string): Promise<void> {
    try {
      if (this.isObjectStorage()) {
        const keys = [filename, `thumb-${filename}`, `${path.parse(filename).name}.webp`];
        await Promise.all(keys.map((Key) => this.client!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key }))));
        return;
      }
      for (const key of [filename, `thumb-${filename}`, `${path.parse(filename).name}.webp`]) {
        const filePath = this.resolveLocalPath(key);
        if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      }
    } catch (err) {
      this.logger.warn(`删除文件失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
