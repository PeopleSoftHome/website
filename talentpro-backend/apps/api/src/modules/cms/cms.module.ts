import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsPageService } from './cms-page.service';
import { CmsContentService } from './cms-content.service';
import { CmsGenericService } from './cms-generic.service';
import { CmsContentRepository } from './cms-content.repository';
import { CmsController } from './cms.controller';

@Module({
  providers: [
    CmsService,
    CmsPageService,
    CmsContentService,
    CmsGenericService,
    CmsContentRepository,
  ],
  controllers: [CmsController],
  exports: [CmsService, CmsGenericService],
})
export class CmsModule {}
