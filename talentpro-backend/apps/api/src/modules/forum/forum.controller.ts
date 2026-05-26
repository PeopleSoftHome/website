import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForumService } from './forum.service';

@ApiTags('Forum')
@Controller('forums')
export class ForumController {
  constructor(private service: ForumService) {}
}
