import { Module } from '@nestjs/common';
import { MarketplaceController, MarketplaceAdminController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';

@Module({
  controllers: [MarketplaceController, MarketplaceAdminController],
  providers: [MarketplaceService, MarketplaceRepository],
})
export class MarketplaceModule {}
