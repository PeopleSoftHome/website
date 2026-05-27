import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DownloadService } from './download.service';
import { Public } from '@/common/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('资源下载')
@Controller('downloads')
export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '提交下载留资' })
  async createRecord(@Body() dto: { resourceId: string; name: string; email: string; company?: string; phone?: string; userId?: string }) {
    return this.downloadService.createRecord(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载记录列表' })
  findRecords(
    @Query('resourceId') resourceId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.downloadService.findRecords(
      resourceId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }
}
