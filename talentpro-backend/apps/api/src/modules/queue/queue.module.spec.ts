import { Test, TestingModule } from '@nestjs/testing';
import Redis, { Cluster } from 'ioredis';
import { QueueModule, createBullRootOptions } from './queue.module';
import { REDIS_CLIENT } from '@/common/redis/redis.module';

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    Cluster: jest.fn(),
  };
});

describe('QueueModule', () => {
  describe('createBullRootOptions', () => {
    it('should use a single Redis client as BullMQ connection', () => {
      const mockClient = { mode: 'single' } as unknown as Redis;
      const options = createBullRootOptions(mockClient);
      expect(options.connection).toBe(mockClient);
    });

    it('should use a Redis Cluster client as BullMQ connection', () => {
      const mockCluster = { mode: 'cluster' } as unknown as Cluster;
      const options = createBullRootOptions(mockCluster);
      expect(options.connection).toBe(mockCluster);
    });

    it('should use a Redis Sentinel client as BullMQ connection', () => {
      const mockClient = {
        mode: 'sentinel',
        options: { sentinels: [{ host: 'localhost', port: 26379 }], name: 'mymaster' },
      } as unknown as Redis;
      const options = createBullRootOptions(mockClient);
      expect(options.connection).toBe(mockClient);
    });
  });

  describe('module', () => {
    it('should compile and use REDIS_CLIENT as BullMQ connection', async () => {
      const mockClient = { mode: 'single' } as unknown as Redis;

      const module: TestingModule = await Test.createTestingModule({
        imports: [QueueModule],
      })
        .overrideProvider(REDIS_CLIENT)
        .useValue(mockClient)
        .compile();

      expect(module).toBeDefined();
    });
  });
});
