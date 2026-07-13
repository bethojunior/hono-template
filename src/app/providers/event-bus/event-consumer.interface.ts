import type { EventMessage } from './events'

export interface EventConsumer<T = unknown> {
  readonly eventType: string
  handle(message: EventMessage<T>): Promise<void>
}
