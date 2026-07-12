import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export type PermissionMode = 'any' | 'all';

export interface PermissionMetadata {
  permissions: string[];
  mode: PermissionMode;
}

export const Permission = (
  permissions: string | string[],
  mode: PermissionMode = 'all',
) => {
  const perms = Array.isArray(permissions) ? permissions : [permissions];
  return SetMetadata(PERMISSIONS_KEY, { permissions: perms, mode });
};
