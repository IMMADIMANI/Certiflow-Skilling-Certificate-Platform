import { createClient } from 'redis';

export let redisClient: any = null;
export let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: { connectTimeout: 3000 },
    });
    client.on('error', () => {});
    await client.connect();
    redisClient = client;
    redisAvailable = true;
    console.log('[Redis] Connected successfully');
  } catch {
    console.log('[Redis] Unavailable - running without cache/queues (non-fatal)');
    redisAvailable = false;
  }
}
