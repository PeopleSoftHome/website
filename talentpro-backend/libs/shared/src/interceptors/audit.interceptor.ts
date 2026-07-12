import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

type PrismaModelDelegate = {
  findUnique?: (args: { where: Record<string, unknown> }) => Promise<unknown>;
};

/**
 * 路由前缀 → Prisma 模型名映射
 * 用于审计前获取资源快照。未覆盖的动态路由（如 /cms/content/:type）将跳过 oldValue。
 */
const ROUTE_MODEL_MAP: Record<string, string> = {
  users: 'User',
  roles: 'Role',
  workspaces: 'Workspace',
  'workspace-invites': 'WorkspaceInvite',
  'demo-bookings': 'DemoBooking',
  'blogs/posts': 'BlogPost',
  'blogs/categories': 'BlogCategory',
  'blogs/tags': 'BlogTag',
  'blogs/comments': 'Comment',
  'forums/categories': 'ForumCategory',
  'forums/topics': 'ForumTopic',
  'forums/posts': 'ForumPost',
  'cms/pages': 'Page',
  'cms/sections': 'Section',
  'cms/products': 'Product',
  'cms/industries': 'Industry',
  'cms/testimonials': 'Testimonial',
  'cms/stats': 'Stat',
  'cms/logos': 'ClientLogo',
  'cms/why-us': 'WhyUsTab',
  'cms/ai-cards': 'AiCard',
  'cms/resources': 'Resource',
  'marketplace/apps': 'App',
  'marketplace/categories': 'AppCategory',
  'admin/marketplace/vendors': 'AppVendor',
  'marketplace/workspace/subscriptions': 'Subscription',
  'payments/orders': 'Order',
  medias: 'Media',
  downloads: 'DownloadRecord',
  cases: 'CaseStudy',
  news: 'News',
  careers: 'Job',
  'about/team': 'TeamMember',
  'about/partners': 'Partner',
  'system/settings': 'Setting',
  'system/email-templates': 'EmailTemplate',
  'system/sensitive-words': 'SensitiveWord',
  'system/audit-logs': 'AuditLog',
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'secretKey',
  'apiKey',
  'privateKey',
  'credential',
  'credentials',
  'piiEncryptionKey',
  'jwtSecret',
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.has(lower) || lower.includes('password') || lower.includes('secret');
}

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 4000 ? `${value.slice(0, 4000)}...` : value;
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(k)) {
        result[k] = '[REDACTED]';
      } else {
        result[k] = sanitize(v);
      }
    }
    return result;
  }
  return value;
}

function resolveModelName(routePath: string): string | undefined {
  const prefix = routePath.replace(/^\/api\/v1\//, '').split('/').slice(0, 2).join('/');
  return ROUTE_MODEL_MAP[prefix] || ROUTE_MODEL_MAP[prefix.split('/')[0]];
}

@Injectable()
export class AuditInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;
    const userId = user?.id;

    // 仅审计已认证用户的写操作
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) || !userId) {
      return next.handle();
    }

    const routePath = request.route?.path || request.url;
    const resource = request.path || routePath;
    const action = `${method} ${resource}`;
    const resourceId = request.params?.id;
    const modelName = resolveModelName(routePath);

    let oldValue: unknown | undefined;

    // 变更前快照：更新/删除时获取当前记录
    if (resourceId && modelName && ['PATCH', 'PUT', 'DELETE'].includes(method)) {
      try {
        const prismaModels = this.prisma as unknown as Record<string, PrismaModelDelegate | undefined>;
        const model = prismaModels[modelName];
        const record = await model?.findUnique?.({ where: { id: resourceId } });
        if (record) oldValue = sanitize(record);
      } catch {
        // 获取快照失败不应阻塞主流程
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          let newValue: unknown | undefined;
          if (method === 'DELETE') {
            newValue = undefined;
          } else if (response && typeof response === 'object') {
            newValue = sanitize(response);
          } else if (request.body && typeof request.body === 'object') {
            newValue = sanitize(request.body);
          }

          await this.prisma.auditLog.create({
            data: {
              userId,
              action,
              resource,
              resourceId: resourceId || undefined,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              oldValue: oldValue ?? undefined,
              newValue: newValue ?? undefined,
            },
          });
        } catch {
          // 审计失败不应影响主业务
        }
      }),
    );
  }
}
