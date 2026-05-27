import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsPageService } from './cms-page.service';
import { CmsContentService } from './cms-content.service';
import { CmsController } from './cms.controller';

@Module({
  providers: [CmsService, CmsPageService, CmsContentService],
  controllers: [CmsController],
  exports: [CmsService],
})
export class CmsModule {}
