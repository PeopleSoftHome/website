import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionGuard } from '@shared/guards';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  const createContext = (metadata: unknown, user?: Record<string, unknown>) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
  });

  it('should allow when no metadata', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext(undefined))).toBe(true);
  });

  it('should allow SUPER_ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      permissions: ['user:read'],
      mode: 'all',
    });
    expect(
      guard.canActivate(createContext({}, { role: { name: 'SUPER_ADMIN' } })),
    ).toBe(true);
  });

  it('should allow with all permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      permissions: ['user:read', 'user:write'],
      mode: 'all',
    });
    expect(
      guard.canActivate(
        createContext({}, { role: { name: 'ADMIN', permissions: [{ resource: 'user', action: 'read' }, { resource: 'user', action: 'write' }] } }),
      ),
    ).toBe(true);
  });

  it('should allow with any permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      permissions: ['user:write'],
      mode: 'any',
    });
    expect(
      guard.canActivate(
        createContext({}, { role: { name: 'ADMIN', permissions: [{ resource: 'user', action: 'write' }] } }),
      ),
    ).toBe(true);
  });

  it('should throw when permissions missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      permissions: ['user:write'],
      mode: 'all',
    });
    expect(() =>
      guard.canActivate(
        createContext({}, { role: { name: 'ADMIN', permissions: [{ resource: 'user', action: 'read' }] } }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('should throw when no user role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      permissions: ['user:read'],
      mode: 'all',
    });
    expect(() => guard.canActivate(createContext({}))).toThrow(ForbiddenException);
  });
});
