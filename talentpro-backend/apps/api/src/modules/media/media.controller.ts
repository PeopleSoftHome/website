import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('medias')
export class MediaController {
  constructor(private service: MediaService) {}
}
