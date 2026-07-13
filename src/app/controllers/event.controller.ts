import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { inject, injectable } from 'tsyringe'
import { HttpError } from '../errors/http-error'
import { EventBusProvider } from '../providers/event-bus/event-bus.provider'

@injectable()
export class EventsController {
  constructor(
    @inject(EventBusProvider)
    private readonly eventBusProvider: EventBusProvider
  ) {}

  async index(c: Context) {
    try {
      const status = c.req.query('status')
      const events = await this.eventBusProvider.findEvents(status)
      return c.json(events)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async replay(c: Context) {
    try {
      const id = c.req.param('id')

      if (!id) {
        return c.json({ error: 'Id é obrigatório' }, 400)
      }

      await this.eventBusProvider.replay(id, { force: true })
      return c.body(null, 204)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async replayFailed(c: Context) {
    try {
      const result = await this.eventBusProvider.retryFailedEvents()
      return c.json(result)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }
}
