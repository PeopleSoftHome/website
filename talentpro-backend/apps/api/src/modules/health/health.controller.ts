import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: '健康检查' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: '就绪检查' })
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
    ]);
  }

  @Get('live')
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: '存活检查' })
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }
}
