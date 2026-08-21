import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
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
  constructor(private mediaService: MediaService) {}

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
}
