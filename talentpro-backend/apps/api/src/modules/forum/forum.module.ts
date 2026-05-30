import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumTopicService } from './forum-topic.service';
import { ForumPostService } from './forum-post.service';
import { ForumController } from './forum.controller';
import { ForumCategoryRepository } from './forum-category.repository';
import { ForumTopicRepository } from './forum-topic.repository';

@Module({
  providers: [
    ForumService,
    ForumTopicService,
    ForumPostService,
    ForumCategoryRepository,
    ForumTopicRepository,
  ],
  controllers: [ForumController],
  exports: [ForumService],
})
export class ForumModule {}
