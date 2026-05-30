import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { AboutService } from './about.service';

@ApiTags('了解我们')
@Controller('about')
export class AboutController {
  constructor(private aboutService: AboutService) {}

  @Get('team')
  @Public()
  @ApiOperation({ summary: '团队成员' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'featured', required: false })
  findTeam(
    @Query('department') department?: string,
    @Query('featured') featured?: string,
  ) {
    const feat = featured === undefined ? undefined : featured === 'true';
    return this.aboutService.findTeam(department, feat);
  }

  @Get('partners')
  @Public()
  @ApiOperation({ summary: '合作伙伴' })
  @ApiQuery({ name: 'type', required: false })
  findPartners(@Query('type') type?: string) {
    return this.aboutService.findPartners(type);
  }
}
