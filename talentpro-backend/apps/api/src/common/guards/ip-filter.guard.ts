import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as ipaddr from 'ipaddr.js';

/**
 * 判断 IP/CIDR 模式是否匹配目标地址
 * 支持 IPv4/IPv6 精确匹配与 CIDR，IPv4 额外支持通配符（如 192.168.1.*）
 */
function matchIpPattern(target: string, pattern: string): boolean {
  const trimmedPattern = pattern.trim();
  if (!trimmedPattern) return false;

  // CIDR
  if (trimmedPattern.includes('/')) {
    try {
      const [parsedNetwork, prefix] = ipaddr.parseCIDR(trimmedPattern);
      const parsedTarget = ipaddr.parse(target);
      if (parsedTarget.kind() !== parsedNetwork.kind()) return false;
      return parsedTarget.match(parsedNetwork, prefix);
    } catch {
      return false;
    }
  }

  // Wildcard（仅 IPv4）
  if (trimmedPattern.includes('*')) {
    const regex = new RegExp(
      '^' + trimmedPattern.replace(/\./g, '\\.').replace(/\*/g, '\\d{1,3}') + '$',
    );
    return regex.test(target);
  }

  // Exact match
  try {
    return ipaddr.parse(target).toString() === ipaddr.parse(trimmedPattern).toString();
  } catch {
    return target === trimmedPattern;
  }
}

@Injectable()
export class IpFilterGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

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

  /**
   * 获取客户端真实 IP
   * - 配置 TRUSTED_PROXIES 后，才信任 X-Forwarded-For
   * - 否则直接使用 Express 解析的 request.ip，避免客户端伪造
   */
  private getClientIp(request: Request): string {
    const trustedProxies = this.parseIpList('TRUSTED_PROXIES');
    const remoteAddress =
      (request.socket?.remoteAddress) ||
      (request.connection?.remoteAddress) ||
      request.ip ||
      '';

    const forwarded = request.headers['x-forwarded-for'];
    if (
      trustedProxies.length > 0 &&
      remoteAddress &&
      trustedProxies.some((pattern) => matchIpPattern(remoteAddress, pattern)) &&
      typeof forwarded === 'string' &&
      forwarded.length > 0
    ) {
      // 取 X-Forwarded-For 中第一个非空地址作为客户端地址
      const firstIp = forwarded.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    return request.ip || remoteAddress;
  }

  private parseIpList(envKey: string): string[] {
    const value = this.configService.get<string>(envKey, '');
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
