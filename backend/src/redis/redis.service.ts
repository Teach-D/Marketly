import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
    });

    this.client.on('error', (err) => this.logger.error('Redis 연결 오류', err));
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.client.del(...keys);
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hIncrBy(key: string, field: string, increment: number): Promise<number> {
    return this.client.hincrby(key, field, increment);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key) as Promise<Record<string, string>>;
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async incrByFloat(key: string, increment: number, ttlSeconds?: number): Promise<void> {
    await this.client.incrbyfloat(key, increment);
    if (ttlSeconds) await this.client.expire(key, ttlSeconds);
  }

  async incrBy(key: string, increment: number, ttlSeconds?: number): Promise<void> {
    await this.client.incrby(key, increment);
    if (ttlSeconds) await this.client.expire(key, ttlSeconds);
  }

  async mGet(keys: string[]): Promise<Array<string | null>> {
    if (!keys.length) return [];
    return this.client.mget(...keys);
  }

  async setString(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async evalScript(script: string, keys: string[], args: string[]): Promise<number> {
    const result = await this.client.eval(script, keys.length, ...keys, ...args);
    return typeof result === 'number' ? result : parseInt(result as string, 10);
  }

  async zIncrBy(key: string, increment: number, member: string): Promise<number> {
    const result = await this.client.zincrby(key, increment, member);
    return parseFloat(result);
  }

  async zRevRangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<Array<{ member: string; score: number }>> {
    const raw = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
    const entries: Array<{ member: string; score: number }> = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ member: raw[i], score: parseFloat(raw[i + 1]) });
    }
    return entries;
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.scanKeys(pattern);
    if (keys.length > 0) await this.client.del(...keys);
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, found] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...found);
    } while (cursor !== '0');
    return keys;
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
