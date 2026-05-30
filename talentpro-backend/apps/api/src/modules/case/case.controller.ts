import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CaseService } from './case.service';

@ApiTags('客户案例')
@Controller('cases')
export class CaseController {
  constructor(private caseService: CaseService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '案例列表' })
  @ApiQuery({ name: 'industry', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('industry') industry?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    const feat = featured === undefined ? undefined : featured === 'true';
    return this.caseService.findAll(industry, feat, p, ps);
  }

  @Get('industries')
  @Public()
  @ApiOperation({ summary: '案例行业分类' })
  findIndustries() {
    return this.caseService.findIndustries();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: '案例详情' })
  findBySlug(@Param('slug') slug: string) {
    return this.caseService.findBySlug(slug);
  }
}
