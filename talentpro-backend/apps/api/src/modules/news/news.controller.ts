import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@shared/decorators/public.decorator';
import { NewsService } from './news.service';

@ApiTags('新闻中心')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '新闻列表' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.newsService.findAll(category, p, ps);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: '新闻分类' })
  findCategories() {
    return this.newsService.findCategories();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: '新闻详情' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }
}
