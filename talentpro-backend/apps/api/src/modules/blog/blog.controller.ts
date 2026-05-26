import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';

@ApiTags('Blog')
@Controller('blogs')
export class BlogController {
  constructor(private service: BlogService) {}
}
