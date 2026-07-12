import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredTokens() {
    const [blResult, rtResult] = await Promise.all([
      this.prisma.tokenBlacklist.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      }),
    ]);
    this.logger.log(
      `Cleaned up ${blResult.count} expired token blacklist entries, ${rtResult.count} expired refresh tokens`,
    );
  }
}
