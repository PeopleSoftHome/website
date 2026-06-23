import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchMeilisearchService } from './search-meilisearch.service';
import { SearchPrismaService } from './search-prisma.service';
import { SearchIndexService } from './search-index.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'search-index',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
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
