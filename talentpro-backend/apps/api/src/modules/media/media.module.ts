import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';
import { SignedUrlService } from './signed-url.service';

@Module({
  providers: [MediaService, MediaRepository, StorageService, SignedUrlService],
  controllers: [MediaController],
  exports: [StorageService, MediaService, SignedUrlService],
})
export class MediaModule {}
