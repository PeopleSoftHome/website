import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SearchIndexService } from '../modules/search/search-index.service';

@Processor('search-index')
export class SearchIndexProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchIndexProcessor.name);

  constructor(private readonly indexService: SearchIndexService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { entityType, entityId, action, payload } = job.data;

    switch (action) {
      case 'create':
        await this.indexService.indexDocument(entityType, payload);
        break;
      case 'update':
        await this.indexService.updateDocument(entityType, entityId, payload);
        break;
      case 'delete':
        await this.indexService.deleteDocument(entityType, entityId);
        break;
      default:
        break;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Search index job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`,
    );
  }
}
