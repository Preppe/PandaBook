import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClient;

  constructor(private configService: ConfigService<AllConfigType>) {}

  onModuleInit() {
    const redisConfig = this.configService.get('redis', { infer: true });
    this.client = new Redis({
      host: redisConfig?.host,
      port: redisConfig?.port,
      password: redisConfig?.password,
      // Add other options like db index if needed
      lazyConnect: true, // Connect explicitly
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      // Handle connection errors appropriately (e.g., logging, retries)
    });

    this.client.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });

    console.log('Redis client initialized');
  }

  onModuleDestroy() {
    this.client.quit(); // Gracefully close the connection
    console.log('Redis client connection closed');
  }

  getClient(): RedisClient {
    if (!this.client || this.client.status !== 'ready') {
       // Optional: attempt reconnect or throw error if not connected
       console.warn('Redis client not ready or not connected.');
       // Consider throwing an error or implementing retry logic
    }
    return this.client;
  }

  // Example method for HSET
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.getClient().hset(key, field, value);
  }

  // Example method for HGETALL
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.getClient().hgetall(key);
  }

  // Method for getting keys matching a pattern (use SCAN in production)
  async keys(pattern: string): Promise<string[]> {
    console.warn('Using KEYS in RedisService. Consider using SCAN for production environments.');
    return this.getClient().keys(pattern);
  }

  // Method for deleting keys
  async del(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.getClient().del(keys);
  }

   // Add other Redis commands as needed (e.g., SCAN)
   async scan(cursor: string, pattern: string, count?: number): Promise<[string, string[]]> {
     const client = this.getClient();
     if (count) {
       // Call with explicit arguments including COUNT
       return client.scan(cursor, 'MATCH', pattern, 'COUNT', count.toString());
     } else {
       // Call with explicit arguments without COUNT
       return client.scan(cursor, 'MATCH', pattern);
     }
     // The return type [string, string[]] is usually inferred correctly by ioredis for scan promises
   }
 }
