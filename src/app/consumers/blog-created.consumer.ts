import { inject, injectable } from 'tsyringe'
import { BlogCreatedPayload } from '../entities/blog-created.entity'
import { BLOGS_CACHE_KEY, BlogEntity } from '../entities/blog.entity'
import { CacheProvider } from '../providers/cache/cache.provider'
import type { EventConsumer } from '../providers/event-bus/event-consumer.interface'
import type { EventMessage } from '../providers/event-bus/events'
import { PrismaProvider } from '../providers/prisma/prisma.provider'

@injectable()
export class BlogCreatedConsumer implements EventConsumer<BlogCreatedPayload> {
  readonly eventType = 'blog.created'

  constructor(
    @inject(PrismaProvider)
    private readonly prismaProvider: PrismaProvider,
    @inject(CacheProvider)
    private readonly cacheProvider: CacheProvider
  ) {}

  async handle(message: EventMessage<BlogCreatedPayload>): Promise<void> {
    const { payload } = message

    const blog = await this.prismaProvider.blog.create({
      data: {
        title: payload.title,
        content: payload.content,
      },
    })

    const cachedBlogs = await this.cacheProvider.get<BlogEntity[]>(BLOGS_CACHE_KEY)

    if (cachedBlogs) {
      await this.cacheProvider.set(BLOGS_CACHE_KEY, [...cachedBlogs, blog])
    }

    console.log('blog created', blog)
  }
}
