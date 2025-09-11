import Redis, { RedisOptions } from 'ioredis';

// Determine if we're in a build/test environment
const isBuildTime = process.env.NODE_ENV === 'test' || process.env.NEXT_PHASE === 'phase-production-build';

// Redis configuration
const redisConfig: RedisOptions = process.env.REDIS_URL 
  ? { 
      // If REDIS_URL is provided, use it
      lazyConnect: true, // Don't connect immediately
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        // Don't retry during build
        if (isBuildTime) return null;
        return Math.min(times * 50, 1000);
      },
    }
  : {
      // Fallback to default configuration
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (isBuildTime) return null;
        return Math.min(times * 50, 1000);
      },
    };

// Create Redis instance with proper error handling
const createRedisInstance = () => {
  // During build time, return a mock Redis instance
  if (isBuildTime) {
    return {
      get: async () => null,
      set: async () => null,
      setex: async () => null,
      del: async () => null,
      // Add other methods you use as needed
    } as unknown as Redis;
  }

  // Create Redis instance with URL if provided, otherwise use config
  const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, redisConfig)
    : new Redis(redisConfig);

  redis.on('error', (error: Error) => {
    // Only log Redis connection errors in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Redis connection error:', error);
    }
  });

  return redis;
};

// Export a singleton instance
const redis = createRedisInstance();

export default redis; 