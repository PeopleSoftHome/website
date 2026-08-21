import { Module } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { PlatformController } from './platform.controller';

@Module({
  providers: [ToolRegistryService],
  controllers: [PlatformController],
  exports: [ToolRegistryService],
})
export class AiPlatformModule {}
