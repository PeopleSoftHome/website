import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('searchs')
export class SearchController {
  constructor(private service: SearchService) {}
}
