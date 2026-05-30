import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CareersService } from './careers.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@ApiTags('加入我们')
@Controller('careers')
export class CareersController {
  constructor(private careersService: CareersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '职位列表' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('type') type?: string,
    @Query('department') department?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.careersService.findAll(type, department, location, p, ps);
  }

  @Get('departments')
  @Public()
  @ApiOperation({ summary: '部门列表' })
  findDepartments() {
    return this.careersService.findDepartments();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '职位详情' })
  findById(@Param('id') id: string) {
    return this.careersService.findById(id);
  }

  @Post(':id/apply')
  @Public()
  @ApiOperation({ summary: '投递简历' })
  apply(
    @Param('id') id: string,
    @Body() dto: CreateJobApplicationDto,
  ) {
    return this.careersService.apply(id, dto);
  }
}
