import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Res, StreamableFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { extname } from 'path';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { SignedUrlService } from './signed-url.service';
import { RolesGuard } from '@shared/guards';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserContext } from '@shared/types';
import { PaginationDto } from '@shared/dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('媒体库')
@Controller('medias')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private storage: StorageService,
    private signedUrls: SignedUrlService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '媒体文件列表' })
  @ApiQuery({ name: 'mimeType', required: false, description: 'image/video/document' })
  findAll(@Query() pagination: PaginationDto, @Query('mimeType') mimeType?: string) {
    return this.mediaService.findAll(pagination.page, pagination.pageSize, mimeType);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '媒体统计' })
  getStats() {
    return this.mediaService.getStats();
  }

  @Get('file/:filename')
  @ApiOperation({ summary: '短时签名私有对象下载' })
  async serveSignedFile(
    @Param('filename') filename: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const expiresAt = Number(exp);
    this.signedUrls.assert(filename, expiresAt, sig);
    if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
      throw new HttpException('Invalid storage object key', HttpStatus.BAD_REQUEST);
    }

    let stat;
    try {
      stat = await this.storage.stat(filename);
    } catch {
      throw new HttpException('Media file not found', HttpStatus.NOT_FOUND);
    }

    res.setHeader('Content-Type', this.contentType(filename));
    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`);

    return new StreamableFile(this.storage.createReadStream(filename));
  }

  @Get(':id/signed-url')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取短时签名媒体 URL' })
  signedUrl(@Param('id') id: string, @CurrentUser() user: UserContext, @Query('ttl') ttl?: string) {
    const ttlSeconds = ttl ? Number(ttl) : undefined;
    return this.mediaService.createSignedUrl(id, user.workspaceId, ttlSeconds);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '媒体详情（私有对象元数据）' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.mediaService.findOne(id, user.workspaceId);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Permission('media:create')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = /image\/(jpeg|png|gif|webp)|video\/mp4|application\/pdf/.test(file.mimetype);
      cb(allowed ? null : new Error('不支持的文件类型'), allowed);
    },
  }))
  upload(@CurrentUser('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload(file, userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Permission('media:create')
  @ApiOperation({ summary: '创建媒体记录（上传后调用）' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateMediaDto) {
    return this.mediaService.create({ ...dto, createdBy: userId });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Permission('media:update')
  @ApiOperation({ summary: '更新媒体信息' })
  update(@Param('id') id: string, @CurrentUser() user: UserContext, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto, user.workspaceId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Permission('media:delete')
  @ApiOperation({ summary: '删除媒体' })
  delete(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.mediaService.delete(id, user.workspaceId);
  }

  private contentType(filename: string) {
    const ext = extname(filename).toLowerCase();
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
  }
}
