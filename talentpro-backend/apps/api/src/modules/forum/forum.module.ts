import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumTopicService } from './forum-topic.service';
import { ForumPostService } from './forum-post.service';
import { ForumController } from './forum.controller';

@Module({
  providers: [ForumService, ForumTopicService, ForumPostService],
  controllers: [ForumController],
  exports: [ForumService],
})
export class ForumModule {}
