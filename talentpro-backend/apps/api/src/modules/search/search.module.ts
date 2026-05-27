import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchMeilisearchService } from './search-meilisearch.service';
import { SearchPrismaService } from './search-prisma.service';
import { SearchIndexService } from './search-index.service';

@Module({
  providers: [
    SearchService,
    SearchMeilisearchService,
    SearchPrismaService,
    SearchIndexService,
  ],
  controllers: [SearchController],
  exports: [SearchService, SearchIndexService],
})
export class SearchModule {}
