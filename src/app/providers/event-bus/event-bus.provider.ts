import { EventStatus, Prisma } from '@prisma/client'
import { inject, injectable } from 'tsyringe'
import { BadRequestError, NotFoundError } from '../../errors/http-error'
import { PrismaProvider } from '../prisma/prisma.provider'
import { RabbitMqProvider } from '../rabbitmq/rabbitmq.provider'
import { EVENTS_QUEUE, type EventMessage } from './events'
import { MAX_RETRY_ATTEMPTS, nextRetryDelayMs } from './retry-policy'

type EventStatusUpdate = {
  status: EventStatus
  failedReason?: string
}

const RETRYABLE_STATUSES: EventStatus[] = [EventStatus.FAILED_PUBLISH, EventStatus.FAILED_PROCESSING]

@injectable()
export class EventBusProvider {
  constructor(
    @inject(RabbitMqProvider)
    private readonly rabbitMqProvider: RabbitMqProvider,
    @inject(PrismaProvider)
    private readonly prismaProvider: PrismaProvider
  ) {}

  async connect(): Promise<void> {
    await this.rabbitMqProvider.connect()

    const channel = this.rabbitMqProvider.getChannel()
    await channel.assertQueue(EVENTS_QUEUE, { durable: true })

    console.log('✅ EventBus conectado')
  }

  async emit(event: string, payload: unknown): Promise<void> {
    const savedEvent = await this.prismaProvider.event.create({
      data: {
        type: event,
        status: EventStatus.PENDING,
        payload: payload as Prisma.InputJsonValue,
      },
    })

    try {
      const channel = this.rabbitMqProvider.getChannel()

      const message = {
        eventId: savedEvent.id,
        type: event,
        payload,
      }

      channel.sendToQueue(EVENTS_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      })

      await this.updateEvent(savedEvent.id, { status: EventStatus.PUBLISHED })
    } catch (error) {
      await this.updateEvent(savedEvent.id, {
        status: EventStatus.FAILED_PUBLISH,
        failedReason: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  async updateEvent(eventId: string, data: EventStatusUpdate): Promise<void> {
    await this.prismaProvider.event.update({
      where: { id: eventId },
      data,
    })
  }

  async checkQueue(): Promise<boolean> {
    try {
      const channel = this.rabbitMqProvider.getChannel()
      const result = await channel.checkQueue(EVENTS_QUEUE)
      return !!result
    } catch (error) {
      console.error('❌ Fila não está respondendo', error)
      return false
    }
  }

  async findEvents(status?: string) {
    if (status && !Object.values(EventStatus).includes(status as EventStatus)) {
      throw new BadRequestError(`Status inválido: ${status}`)
    }

    return this.prismaProvider.event.findMany({
      where: status ? { status: status as EventStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async replay(eventId: string, options: { force?: boolean } = {}): Promise<void> {
    const event = await this.prismaProvider.event.findUnique({ where: { id: eventId } })

    if (!event) {
      throw new NotFoundError('Evento não encontrado')
    }

    const channel = this.rabbitMqProvider.getChannel()
    const message: EventMessage = { eventId: event.id, type: event.type, payload: event.payload }
    const attempts = options.force ? 0 : event.attempts + 1

    try {
      channel.sendToQueue(EVENTS_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      })

      await this.prismaProvider.event.update({
        where: { id: event.id },
        data: { status: EventStatus.PUBLISHED, failedReason: null, attempts, nextRetryAt: null },
      })
    } catch (error) {
      const isDeadLetter = !options.force && attempts >= MAX_RETRY_ATTEMPTS

      await this.prismaProvider.event.update({
        where: { id: event.id },
        data: {
          status: isDeadLetter ? EventStatus.DEAD_LETTER : EventStatus.FAILED_PUBLISH,
          failedReason: error instanceof Error ? error.message : String(error),
          attempts,
          nextRetryAt: isDeadLetter ? null : new Date(Date.now() + nextRetryDelayMs(attempts)),
        },
      })

      throw error
    }
  }

  async retryFailedEvents(): Promise<{ attempted: number; succeeded: number; failed: number }> {
    const events = await this.prismaProvider.event.findMany({
      where: {
        status: { in: RETRYABLE_STATUSES },
        attempts: { lt: MAX_RETRY_ATTEMPTS },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      orderBy: { updatedAt: 'asc' },
      take: 20,
    })

    let succeeded = 0
    let failed = 0

    for (const event of events) {
      try {
        await this.replay(event.id)
        succeeded++
      } catch {
        failed++
      }
    }

    return { attempted: events.length, succeeded, failed }
  }
}
