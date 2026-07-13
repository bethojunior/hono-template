import KeyvRedis from '@keyv/redis'
import { Cache, createCache } from 'cache-manager'
import Keyv from 'keyv'
import { injectable } from 'tsyringe'

const DEFAULT_TTL = 24 * 60 * 60 * 1000

@injectable()
export class CacheProvider {
  private readonly cache: Cache

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost'
    const port = process.env.REDIS_PORT || '6379'
    const password = process.env.REDIS_PASSWORD

    const auth = password ? `:${password}@` : ''

    this.cache = createCache({
      stores: [
        new Keyv({
          store: new KeyvRedis(`redis://${auth}${host}:${port}`),
          ttl: DEFAULT_TTL,
        }),
      ],
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    return this.cache.set(key, value, ttl)
  }

  async del(key: string): Promise<boolean> {
    return this.cache.del(key)
  }

  async wrap<T>(key: string, fn: () => T | Promise<T>, ttl?: number): Promise<T> {
    return this.cache.wrap(key, fn, ttl)
  }
}
