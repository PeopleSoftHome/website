import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DownloadService } from './download.service';
import { Public } from '@/common/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateDownloadRecordDto } from './dto/create-download-record.dto';

@ApiTags('资源下载')
@Controller('downloads')
export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '提交下载留资' })
  async createRecord(@Body() dto: CreateDownloadRecordDto) {
    return this.downloadService.createRecord(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载记录列表' })
  findRecords(
    @Query() pagination: PaginationDto,
    @Query('resourceId') resourceId?: string,
  ) {
    return this.downloadService.findRecords(
      resourceId,
      pagination.page,
      pagination.pageSize,
    );
  }
}
