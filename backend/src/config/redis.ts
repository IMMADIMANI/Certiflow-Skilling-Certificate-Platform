import { createClient } from 'redis';

export let redisClient: any = null;
export let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  // Skip Redis entirely if not configured
  if (process.env.SKIP_REDIS === 'true') {
    console.log('[Redis] Skipped (SKIP_REDIS=true)');
    return;
  }
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: false, // Don't retry — fail fast
      },
    });
    // Timeout promise so it never hangs
    const connectWithTimeout = Promise.race([
      client.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 2500)
      ),
    ]);
    client.on('error', () => {});
    await connectWithTimeout;
    redisClient = client;
    redisAvailable = true;
    console.log('[Redis] Connected successfully');
  } catch {
    console.log('[Redis] Unavailable - running without cache/queues (non-fatal)');
    redisAvailable = false;
  }
}
