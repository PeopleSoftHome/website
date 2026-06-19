import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LeadService } from './lead.service';
import { LeadStatus } from '@prisma/client';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserContext } from '@/common/types';
import { Request } from 'express';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { AddFollowUpDto } from './dto/add-follow-up.dto';

@ApiTags('线索管理')
@Controller('demo-bookings')
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索列表' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  findAll(
    @CurrentUser() user: UserContext,
    @Query() pagination: PaginationDto,
    @Query('status') status?: LeadStatus,
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    return this.leadService.findAll(
      pagination.page,
      pagination.pageSize,
      status,
      workspaceId,
    );
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索统计' })
  getStats() {
    return this.leadService.getStats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '线索详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserContext) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    return this.leadService.findOne(id, workspaceId);
  }

  @Post()
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ lead: { limit: 5, ttl: 3600000 } })
  @ApiOperation({ summary: '提交预约演示' })
  create(@Body() dto: CreateLeadDto, @Req() req: Request) {
    return this.leadService.create({
      ...dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('lead:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新线索状态' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    return this.leadService.updateStatus(id, dto.status, dto.assignedTo, dto.notes, workspaceId);
  }

  @Post(':id/follow-ups')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('lead:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加跟进记录' })
  addFollowUp(@Param('id') id: string, @CurrentUser() user: UserContext, @Body() dto: AddFollowUpDto) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    return this.leadService.addFollowUp(id, dto, workspaceId);
  }
}
