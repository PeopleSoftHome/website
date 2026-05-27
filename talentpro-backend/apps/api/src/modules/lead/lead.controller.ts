import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { LeadStatus } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('线索管理')
@Controller('demo-bookings')
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索列表' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: LeadStatus,
  ) {
    return this.leadService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索统计' })
  getStats() {
    return this.leadService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索详情' })
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  @Post()
  @Public()
  @UseGuards(RecaptchaGuard)
  @ApiOperation({ summary: '提交预约演示' })
  create(@Body() dto: {
    name: string;
    company: string;
    phone: string;
    email?: string;
    products?: string[];
    scale: string;
    workspaceId?: string;
  }, @Req() req: Request) {
    return this.leadService.create({
      ...dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新线索状态' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: LeadStatus; assignedTo?: string; notes?: string },
  ) {
    return this.leadService.updateStatus(id, dto.status, dto.assignedTo, dto.notes);
  }

  @Post(':id/follow-ups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加跟进记录' })
  addFollowUp(@Param('id') id: string, @Body() dto: { type: string; content: string; createdBy: string }) {
    return this.leadService.addFollowUp(id, dto);
  }
}
