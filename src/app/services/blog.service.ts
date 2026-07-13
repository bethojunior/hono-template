import { inject, injectable } from 'tsyringe'
import type { CreateBlogDto } from '../dto/blog/create-blog.dto'
import type { UpdateBlogDto } from '../dto/blog/update-blog.dto'
import { blogCacheKey, BlogEntity, BLOGS_CACHE_KEY } from '../entities/blog.entity'
import { HttpError, NotFoundError } from '../errors/http-error'
import { CacheProvider } from '../providers/cache/cache.provider'
import { EventBusProvider } from '../providers/event-bus/event-bus.provider'
import { PrismaProvider } from '../providers/prisma/prisma.provider'

@injectable()
export class BlogService {
  constructor(
    @inject(PrismaProvider)
    private readonly prismaProvider: PrismaProvider,
    @inject(CacheProvider)
    private readonly cacheProvider: CacheProvider,
    @inject(EventBusProvider)
    private readonly eventBusProvider: EventBusProvider
  ) {}

  async store(data: CreateBlogDto): Promise<{ message: string }> {
    try {
      await this.eventBusProvider.emit('blog.created', {
        title: data.title,
        content: data.content,
        resources: data.resources || [],
      })

      return { message: 'Blog creation requested' }
    } catch (error) {
      throw error
    }
  }

  async findAll(skip = 0, take = 100): Promise<BlogEntity[]> {
    try {
      const cached = await this.cacheProvider.get<BlogEntity[]>(BLOGS_CACHE_KEY)

      if (cached) return cached

      const blogs = await this.prismaProvider.blog.findMany({
        include: {
          resources: {
            include: {
              resource: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      })

      await this.cacheProvider.set(BLOGS_CACHE_KEY, blogs)

      return blogs
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string): Promise<BlogEntity> {
    try {
      const cached = await this.cacheProvider.get<BlogEntity>(blogCacheKey(id))

      if (cached) return cached

      const blog = await this.prismaProvider.blog.findUnique({
        where: { id },
        include: {
          resources: {
            include: {
              resource: true,
            },
          },
        },
      })

      if (!blog) throw new NotFoundError('Blog not found')

      await this.cacheProvider.set(blogCacheKey(id), blog)

      return blog
    } catch (error) {
      throw error
    }
  }

  async update(id: string, data: UpdateBlogDto): Promise<BlogEntity> {
    try {
      const blog = await this.prismaProvider.blog.update({
        where: { id },
        data,
        include: {
          resources: {
            include: {
              resource: true,
            },
          },
        },
      })

      await this.cacheProvider.set(blogCacheKey(id), blog)
      await this.cacheProvider.del(BLOGS_CACHE_KEY)

      return blog
    } catch (error) {
      throw error
    }
  }

  async remove(id: string): Promise<BlogEntity> {
    try {
      const blog = await this.prismaProvider.blog.delete({
        where: { id },
        include: {
          resources: {
            include: {
              resource: true,
            },
          },
        },
      })

      await this.cacheProvider.del(blogCacheKey(id))
      await this.cacheProvider.del(BLOGS_CACHE_KEY)

      return blog
    } catch (error) {
      throw error
    }
  }
}
