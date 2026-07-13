import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { inject, injectable } from 'tsyringe'
import { CreateBlogDto } from '../dto/blog/create-blog.dto'
import { UpdateBlogDto } from '../dto/blog/update-blog.dto'
import { HttpError } from '../errors/http-error'
import { BlogService } from '../services/blog.service'

@injectable()
export class BlogController {
  constructor(
    @inject(BlogService)
    private readonly service: BlogService
  ) {}

  async index(c: Context) {
    try {
      const skip = parseInt(c.req.query('skip') || '0', 10)
      const take = parseInt(c.req.query('take') || '100', 10)
      
      const blogs = await this.service.findAll(skip, take)
      return c.json(blogs)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async store(c: Context) {
    try {
      const body = c.get('body') as CreateBlogDto
      const result = await this.service.store(body)
      return c.json(result, 202)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async show(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) return c.json({ error: 'Id é obrigatório' }, 400)

      const blog = await this.service.findOne(id)
      return c.json(blog)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) return c.json({ error: 'Id é obrigatório' }, 400)

      const body = c.get('body') as UpdateBlogDto
      const blog = await this.service.update(id, body)
      return c.json(blog)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async destroy(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) return c.json({ error: 'Id é obrigatório' }, 400)

      await this.service.remove(id)
      return c.body(null, 204)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }
}
