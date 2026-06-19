import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @Public()
  @Throttle({ search: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: '全文搜索' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', required: false, description: 'post | product | industry | resource' })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.searchService.search(q, {
      type,
      limit: limit ? Number(limit) || 20 : 20,
    });
    return { data: results, meta: { query: q, count: results.length } };
  }

  @Get('suggestions')
  @Public()
  @Throttle({ search: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: '搜索建议' })
  @ApiQuery({ name: 'q', required: true })
  async getSuggestions(@Query('q') q: string) {
    const suggestions = await this.searchService.suggest(q);
    return { data: suggestions };
  }
}
