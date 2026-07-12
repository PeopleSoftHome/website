import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { CACHE_KEY, CACHE_TTL, CACHE_EVICT, Cacheable, CacheEvict } from './cache.decorator';
import { currentUserFactory } from './current-user.decorator';
import { ROLES_KEY, Roles } from './roles.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';
import { PERMISSIONS_KEY, Permission } from './permission.decorator';

describe('Common decorators', () => {
  describe('Cacheable / CacheEvict', () => {
    it('should set cache key and ttl metadata', () => {
      class Target {
        @Cacheable({ key: 'test', ttl: 120 })
        method() {}
      }
      const reflector = new Reflector();
      const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, 'method');
      expect(reflector.get(CACHE_KEY, descriptor!.value)).toBe('test');
      expect(reflector.get(CACHE_TTL, descriptor!.value)).toBe(120);
    });

    it('should default cache ttl to 60', () => {
      class Target {
        @Cacheable({ key: 'test' })
        method() {}
      }
      const reflector = new Reflector();
      const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, 'method');
      expect(reflector.get(CACHE_TTL, descriptor!.value)).toBe(60);
    });

    it('should support CacheEvict with keys array', () => {
      class Target {
        @CacheEvict({ keys: ['a', 'b'] })
        method() {}
      }
      const reflector = new Reflector();
      const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, 'method');
      expect(reflector.get(CACHE_EVICT, descriptor!.value)).toEqual(['a', 'b']);
    });

    it('should fallback CacheEvict key to array', () => {
      class Target {
        @CacheEvict({ key: 'a' })
        method() {}
      }
      const reflector = new Reflector();
      const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, 'method');
      expect(reflector.get(CACHE_EVICT, descriptor!.value)).toEqual(['a']);
    });
  });

  describe('Roles / Public / Permissions', () => {
    it('Roles should set metadata', () => {
      @Roles('ADMIN')
      class Target {}
      expect(Reflect.getMetadata(ROLES_KEY, Target)).toEqual(['ADMIN']);
    });

    it('Public should set metadata', () => {
      @Public()
      class Target {}
      expect(Reflect.getMetadata(IS_PUBLIC_KEY, Target)).toBe(true);
    });

    it('Permission should set metadata', () => {
      @Permission('user:read')
      class Target {}
      expect(Reflect.getMetadata(PERMISSIONS_KEY, Target)).toEqual({
        permissions: ['user:read'],
        mode: 'all',
      });
    });
  });

  describe('CurrentUser', () => {
    const createCtx = (user: Record<string, unknown>) =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      }) as ExecutionContext;

    it('should return whole user when no data key', () => {
      const mockUser = { id: 'u1', workspaceId: 'w1' };
      expect(currentUserFactory(undefined, createCtx(mockUser))).toEqual(mockUser);
    });

    it('should return user property when data key provided', () => {
      const mockUser = { id: 'u1', workspaceId: 'w1' };
      expect(currentUserFactory('id', createCtx(mockUser))).toBe('u1');
    });
  });
});
