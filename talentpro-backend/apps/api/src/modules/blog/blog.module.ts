import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPostService } from './blog-post.service';
import { BlogCommentService } from './blog-comment.service';
import { CommentModerationService } from './comment-moderation.service';
import { BlogController } from './blog.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [BlogService, BlogPostService, BlogCommentService, CommentModerationService],
  controllers: [BlogController],
  exports: [BlogService, CommentModerationService],
})
export class BlogModule {}
