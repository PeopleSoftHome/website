import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@shared/guards';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { ToolRegistryService } from './tool-registry.service';
import { ToolInvocationRequest } from './tool-registry.types';

@ApiTags('AI Platform')
@ApiBearerAuth()
@Controller('platform/v1')
@UseGuards(RolesGuard)
export class PlatformController {
  constructor(private readonly tools: ToolRegistryService) {}

  @Get('tools')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:tools:read')
  @ApiOperation({ summary: 'List governed AI tools' })
  async listTools() {
    return this.tools.list();
  }

  @Post('tools/invoke')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:tools:invoke')
  @ApiOperation({ summary: 'Invoke a governed AI tool' })
  async invokeTool(@Body() request: ToolInvocationRequest) {
    return this.tools.invoke(request);
  }
}
