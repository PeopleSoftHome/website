import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PermissionMetadata,
} from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata || metadata.permissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // SUPER_ADMIN 绕过所有权限检查
    if (user.role.name === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions: string[] =
      user.role.permissions?.map(
        (p: { resource: string; action: string }) => `${p.resource}:${p.action}`,
      ) || [];

    const { permissions: requiredPermissions, mode } = metadata;

    let hasPermission: boolean;
    if (mode === 'any') {
      hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm),
      );
    } else {
      hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions，需要${mode === 'any' ? '任一' : '全部'}权限: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
