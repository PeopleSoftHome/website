import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('mimeType') mimeType?: string,
  ) {
    return this.mediaService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      mimeType,
    );
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '媒体统计' })
  getStats() {
    return this.mediaService.getStats();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '媒体详情' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建媒体记录（上传后调用）' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: {
      filename: string;
      originalName: string;
      url: string;
      mimeType: string;
      size: number;
      width?: number;
      height?: number;
      alt?: string;
    },
  ) {
    return this.mediaService.create({ ...dto, createdBy: userId });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新媒体信息' })
  update(@Param('id') id: string, @Body() dto: { alt?: string; originalName?: string }) {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除媒体' })
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
