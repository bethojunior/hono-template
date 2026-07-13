import { EventStatus, Prisma } from '@prisma/client'
import { inject, injectable } from 'tsyringe'
import { PrismaProvider } from '../prisma/prisma.provider'
import { RabbitMqProvider } from '../rabbitmq/rabbitmq.provider'
import { EVENTS_QUEUE } from './events'

type EventStatusUpdate = {
  status: EventStatus
  failedReason?: string
}

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
}
