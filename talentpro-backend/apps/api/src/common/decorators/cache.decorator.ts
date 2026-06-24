import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';
export const CACHE_EVICT = 'cache_evict';

export interface CacheOptions {
  key: string;
  ttl?: number; // seconds, default 60
}

export interface CacheEvictOptions {
  key?: string;
  keys?: string[];
}

export const Cacheable = (options: CacheOptions) => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, options.key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL, options.ttl || 60)(target, propertyKey, descriptor);
  };
};

export const CacheEvict = (options: CacheEvictOptions) => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const keys = options.keys ?? (options.key ? [options.key] : []);
    SetMetadata(CACHE_EVICT, keys)(target, propertyKey, descriptor);
  };
};
