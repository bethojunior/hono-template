import type { Context } from 'hono'
import { inject, injectable } from 'tsyringe'
import { ResourceService } from '../services/resource.service'

@injectable()
export class ResourceController {
  constructor(
    @inject(ResourceService)
    private readonly service: ResourceService
  ) {}

  async store(c: Context) {
    try {
      const body = await c.req.parseBody()
      const file = body.file

      if (!(file instanceof File)) {
        return c.json({ error: 'Arquivo é obrigatório' }, 400)
      }

      const flow = typeof body.flow === 'string' ? body.flow : undefined

      const resource = await this.service.store(file, flow)
      return c.json(resource, 201)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async show(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) {
        return c.json({ error: 'Id é obrigatório' }, 400)
      }

      const resource = await this.service.findOne(id)

      if (!resource) {
        return c.json({ error: 'Arquivo não encontrado' }, 404)
      }

      return c.json(resource)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async destroy(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) {
        return c.json({ error: 'Id é obrigatório' }, 400)
      }

      await this.service.delete(id)
      return c.body(null, 204)
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500)
    }
  }
}
