jest.mock('ioredis', () => {
  return class MockRedis {
    get = jest.fn().mockResolvedValue(null);
    set = jest.fn().mockResolvedValue('OK');
    del = jest.fn().mockResolvedValue(1);
    keys = jest.fn().mockResolvedValue([]);
    on = jest.fn();
    once = jest.fn();
    connect = jest.fn().mockResolvedValue(undefined);
    disconnect = jest.fn().mockResolvedValue(undefined);
    quit = jest.fn().mockResolvedValue(undefined);
    pipeline = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    multi = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    isCluster = false;
  };
});

// Also mock Cluster mode
jest.mock('ioredis', () => {
  const MockRedis = class MockRedis {
    get = jest.fn().mockResolvedValue(null);
    set = jest.fn().mockResolvedValue('OK');
    del = jest.fn().mockResolvedValue(1);
    keys = jest.fn().mockResolvedValue([]);
    on = jest.fn();
    once = jest.fn();
    connect = jest.fn().mockResolvedValue(undefined);
    disconnect = jest.fn().mockResolvedValue(undefined);
    quit = jest.fn().mockResolvedValue(undefined);
    pipeline = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    multi = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    isCluster = false;
  };

  (MockRedis as any).Cluster = class MockCluster {
    get = jest.fn().mockResolvedValue(null);
    set = jest.fn().mockResolvedValue('OK');
    del = jest.fn().mockResolvedValue(1);
    on = jest.fn();
    once = jest.fn();
    connect = jest.fn().mockResolvedValue(undefined);
    disconnect = jest.fn().mockResolvedValue(undefined);
    quit = jest.fn().mockResolvedValue(undefined);
  };

  return MockRedis;
}, { virtual: true });

jest.setTimeout(60000);
