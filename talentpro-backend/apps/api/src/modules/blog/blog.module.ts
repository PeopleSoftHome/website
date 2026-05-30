import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPostService } from './blog-post.service';
import { BlogCommentService } from './blog-comment.service';
import { CommentModerationService } from './comment-moderation.service';
import { BlogController } from './blog.controller';
import { BlogCategoryRepository } from './blog-category.repository';
import { BlogTagRepository } from './blog-tag.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [
    BlogService,
    BlogPostService,
    BlogCommentService,
    CommentModerationService,
    BlogCategoryRepository,
    BlogTagRepository,
  ],
  controllers: [BlogController],
  exports: [BlogService, CommentModerationService],
})
export class BlogModule {}
