import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';

@ApiTags('System')
@Controller('systems')
export class SystemController {
  constructor(private service: SystemService) {}
}
