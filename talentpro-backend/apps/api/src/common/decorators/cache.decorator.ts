import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';
export const CACHE_EVICT = 'cache_evict';

export interface CacheOptions {
  key: string;
  ttl?: number; // seconds, default 60
}

export interface CacheEvictOptions {
  key: string;
}

export const Cacheable = (options: CacheOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, options.key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL, options.ttl || 60)(target, propertyKey, descriptor);
  };
};

export const CacheEvict = (options: CacheEvictOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_EVICT, options.key)(target, propertyKey, descriptor);
  };
};
