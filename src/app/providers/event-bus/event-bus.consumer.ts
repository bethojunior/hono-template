import { EventStatus } from '@prisma/client'
import type { Channel, ConsumeMessage } from 'amqplib'
import { inject, injectable } from 'tsyringe'
import { RabbitMqProvider } from '../rabbitmq/rabbitmq.provider'
import type { EventConsumer } from './event-consumer.interface'
import { EVENTS_QUEUE, type EventMessage } from './events'
import { EventBusProvider } from './event-bus.provider'

@injectable()
export class EventBusConsumer {
  private readonly handlers = new Map<string, EventConsumer>()

  constructor(
    @inject(RabbitMqProvider)
    private readonly rabbitMqProvider: RabbitMqProvider,
    @inject(EventBusProvider)
    private readonly eventBusProvider: EventBusProvider
  ) {}

  register(consumer: EventConsumer): void {
    this.handlers.set(consumer.eventType, consumer)
  }

  async start(): Promise<void> {
    const channel = this.rabbitMqProvider.getChannel()
    await channel.assertQueue(EVENTS_QUEUE, { durable: true })
    await channel.prefetch(10)

    await channel.consume(EVENTS_QUEUE, (msg) => {
      if (!msg) return
      void this.processMessage(msg, channel)
    })

    console.log(`✅ Consumindo eventos da fila "${EVENTS_QUEUE}"`)
  }

  private async processMessage(msg: ConsumeMessage, channel: Channel): Promise<void> {
    const message = JSON.parse(msg.content.toString()) as EventMessage
    const handler = this.handlers.get(message.type)

    if (!handler) {
      console.warn(`⚠️ Nenhum consumer registrado para o evento "${message.type}"`)
      channel.nack(msg, false, false)
      return
    }

    try {
      await this.eventBusProvider.updateEvent(message.eventId, { status: EventStatus.PROCESSING })
      await handler.handle(message)
      await this.eventBusProvider.updateEvent(message.eventId, { status: EventStatus.PROCESSED })
      channel.ack(msg)
    } catch (error) {
      await this.eventBusProvider.updateEvent(message.eventId, {
        status: EventStatus.FAILED_PROCESSING,
        failedReason: error instanceof Error ? error.message : String(error),
      })
      channel.nack(msg, false, false)
    }
  }
}
