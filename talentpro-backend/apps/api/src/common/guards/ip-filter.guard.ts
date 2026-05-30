import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
}

function parseCidr(cidr: string): { start: number; end: number } {
  const [ip, maskStr] = cidr.split('/');
  const long = ipToLong(ip);
  const bits = parseInt(maskStr, 10);
  const hostBits = 32 - bits;
  const start = Math.floor(long / Math.pow(2, hostBits)) * Math.pow(2, hostBits);
  const end = start + Math.pow(2, hostBits) - 1;
  return { start, end };
}

function matchIpPattern(ip: string, pattern: string): boolean {
  // CIDR
  if (pattern.includes('/')) {
    const { start, end } = parseCidr(pattern);
    const long = ipToLong(ip);
    return long >= start && long <= end;
  }

  // Wildcard
  if (pattern.includes('*')) {
    const regex = new RegExp(
      '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '\\d{1,3}') + '$',
    );
    return regex.test(ip);
  }

  // Exact match
  return ip === pattern;
}

function getClientIp(request: any): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || '';
}

@Injectable()
export class IpFilterGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = getClientIp(request);

    // 未获取到 IP，默认放行
    if (!clientIp) {
      return true;
    }

    const allowedIps = this.parseIpList('APP_ALLOWED_IPS');
    const blockedIps = this.parseIpList('APP_BLOCKED_IPS');

    // 白名单优先：如果配置了白名单，只允许白名单 IP
    if (allowedIps.length > 0) {
      const isAllowed = allowedIps.some((pattern) =>
        matchIpPattern(clientIp, pattern),
      );
      if (!isAllowed) {
        throw new ForbiddenException('Access denied from this IP');
      }
      return true;
    }

    // 黑名单：拒绝黑名单 IP
    if (blockedIps.length > 0) {
      const isBlocked = blockedIps.some((pattern) =>
        matchIpPattern(clientIp, pattern),
      );
      if (isBlocked) {
        throw new ForbiddenException('Access denied from this IP');
      }
    }

    return true;
  }

  private parseIpList(envKey: string): string[] {
    const value = this.configService.get<string>(envKey, '');
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
