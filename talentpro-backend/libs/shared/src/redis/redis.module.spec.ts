import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';
import { RedisModule, REDIS_CLIENT, createRedisClient } from './redis.module';

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    Cluster: jest.fn(),
  };
});

const MockedRedis = Redis as unknown as jest.Mock;
const MockedCluster = Cluster as unknown as jest.Mock;

describe('RedisModule', () => {
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = new ConfigService();
  });

  describe('createRedisClient', () => {
    it('should create a single Redis client when REDIS_MODE is single', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REDIS_MODE') return 'single';
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        return undefined;
      });

      createRedisClient(configService);

      expect(MockedRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      expect(MockedCluster).not.toHaveBeenCalled();
    });

    it('should create a Redis Cluster client with all nodes when REDIS_MODE is cluster', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REDIS_MODE') return 'cluster';
        if (key === 'REDIS_CLUSTER_NODES')
          return '10.0.0.11:6379,10.0.0.12:6379,10.0.0.13:6379';
        return undefined;
      });

      createRedisClient(configService);

      expect(MockedCluster).toHaveBeenCalledWith(
        [
          { host: '10.0.0.11', port: 6379 },
          { host: '10.0.0.12', port: 6379 },
          { host: '10.0.0.13', port: 6379 },
        ],
        {
          redisOptions: {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
          },
        },
      );
      expect(MockedRedis).not.toHaveBeenCalled();
    });

    it('should create a Redis Sentinel client when REDIS_MODE is sentinel', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REDIS_MODE') return 'sentinel';
        if (key === 'REDIS_SENTINEL_NODES')
          return '10.0.0.21:26379,10.0.0.22:26379,10.0.0.23:26379';
        if (key === 'REDIS_SENTINEL_MASTER_NAME') return 'mymaster';
        return undefined;
      });

      createRedisClient(configService);

      expect(MockedRedis).toHaveBeenCalledWith({
        sentinels: [
          { host: '10.0.0.21', port: 26379 },
          { host: '10.0.0.22', port: 26379 },
          { host: '10.0.0.23', port: 26379 },
        ],
        name: 'mymaster',
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      expect(MockedCluster).not.toHaveBeenCalled();
    });

    it('should default to single mode when REDIS_MODE is not set', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REDIS_MODE') return undefined;
        if (key === 'REDIS_URL') return 'redis://localhost:6379';
        return undefined;
      });

      createRedisClient(configService);

      expect(MockedRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    });
  });

  describe('module', () => {
    it('should compile and provide REDIS_CLIENT', async () => {
      MockedRedis.mockImplementation(() => ({}));

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [],
          }),
          RedisModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue({
          get: jest.fn((key: string) => {
            if (key === 'REDIS_MODE') return 'single';
            if (key === 'REDIS_URL') return 'redis://localhost:6379';
            return undefined;
          }),
        })
        .compile();

      const client = module.get(REDIS_CLIENT);
      expect(client).toBeDefined();
    });
  });
});
