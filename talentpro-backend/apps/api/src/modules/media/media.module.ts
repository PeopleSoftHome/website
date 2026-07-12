import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { StorageService } from './storage.service';

@Module({
  providers: [MediaService, MediaRepository, StorageService],
  controllers: [MediaController],
  exports: [StorageService, MediaService],
})
export class MediaModule {}
